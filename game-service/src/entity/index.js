/* eslint-disable no-param-reassign,max-len,no-mixed-operators,no-shadow */
/*
3rd Party library imports
 */
const { fromPromised } = require('folktale/concurrency/task');
const R = require('ramda');
const {
	task, waitAll, of,
} = require('folktale/concurrency/task');

/*
Project file imports
 */
const { GameModel, PlayerModel } = require('../infrastructures/database');
const {
	createTrace, sendEventToStateUpdateTopic, sendEventToPhaseTopic, shuffle,
} = require('../utils');
const Interactions = require('./interactions');

const trace = createTrace('src:entity');

const ROLES = {
	SHERIFF: 'Sheriff',
	DOCTOR: 'Doctor',
	INVESTIGATOR: 'Investigator',
	JAILOR: 'Jailor',
	MEDIUM: 'Medium',
	GODFATHER: 'Godfather',
	FRAMER: 'Framer',
	EXECUTIONER: 'Executioner',
	ESCORT: 'Escort',
	MAFIOSO: 'Mafioso',
	BLACKMAILER: 'Blackmailer',
	SERIAL_KILLER: 'Serial Killer',
	VIGILANTE: 'Vigilante',
	JESTER: 'Jester',
	SPY: 'Spy',
};

const sheriffMapper = ({ target }) => {
	if (target.status === 'jailed') {
		return { source: { interactionResults: ['Your target was jailed last night!'] } };
	} else if (target.status === 'framed'
		|| target.role === ROLES.MAFIOSO
		|| target.role === ROLES.BLACKMAILER
		|| target.role === ROLES.FRAMER) {
		return { source: { interactionResults: ['Your target is a member of the Mafia!'] } };
	} else if (target.role === ROLES.SERIAL_KILLER) {
		return { source: { interactionResults: ['Your target is a Serial Killer!'] } };
	}
	return { source: { interactionResults: ['Your target is not suspicious'] } };
};

const doctorMapper = () => ({
	source: { interactionResults: ['You healed your target'] },
	target: { status: 'healed' },
});

const investigatorMapper = ({ target }) => {
	switch (target.role) {
	case ROLES.SHERIFF:
	case ROLES.EXECUTIONER:
		return { source: { interactionResults: ['Your target could be a Sheriff, or Executioner'] } };
	case ROLES.DOCTOR:
	case ROLES.SERIAL_KILLER:
		return { source: { interactionResults: ['Your target could be a Doctor, or Serial Killer.'] } };
	case ROLES.JAILOR:
	case ROLES.SPY:
	case ROLES.BLACKMAILER:
		return { source: { interactionResults: ['Your target could be a Jailor, Blackmailer or Spy.'] } };
	case ROLES.MEDIUM:
		return { source: { interactionResults: ['Your target could be a Medium, or Janitor'] } };
	case ROLES.GODFATHER:
		return { source: { interactionResults: ['Your target could be a Godfather, or Bodyguard'] } };
	case ROLES.FRAMER:
	case ROLES.JESTER:
		return { source: { interactionResults: ['Your target could be a Framer, or Jester'] } };
	case ROLES.ESCORT:
		return { source: { interactionResults: ['Your target could be a Escort, Transporter, or Consort.'] } };
	case ROLES.MAFIOSO:
	case ROLES.VIGILANTE:
		return { source: { interactionResults: ['Your target could be a Vigilante or Mafioso'] } };
	default:
		return {};
	}
};

const jailorMapper = () => ({
	source: { interactionResults: ['You jailed your target'] },
	target: { status: 'jailed', interactionResults: ['You were haled off to jail!'] },
});

const killerMapper = ({ target }) => {
	if (target.role === ROLES.SERIAL_KILLER
		|| target.role === ROLES.EXECUTIONER
		|| target.role === ROLES.GODFATHER) {
		return { source: { interactionResults: ['Your target\'s defense is too powerful!'] } };
	} else if (target.status === 'jailed') {
		return {
			source: { interactionResults: ['Your target was jailed last night!'] },
			target: { interactionResults: ['Someone tried to attack you last night, but you were jailed'] },
		};
	} else if (target.status === 'healed') {
		return {
			target: { interactionResults: ['Someone tried to attack you last night, but the doctor saves you!'] },
		};
	}
	return { target: { died: true }, source: { interactionResults: ['You killed your target!'] } };
};

const framerMapper = () => ({
	target: { status: 'framed' },
	source: { interactionResults: ['You framed your target!'] },
});

const escortMapper = () => ({
	target: { status: 'blocked' },
	source: { interactionResults: ['You blocked your target!'] },
});

const blackmailerMapper = () => ({
	source: { interactionResults: ['You blackmailed your target!'] },
	target: { status: 'blackmailed', interactionResults: ['You have been blackmailed!'] },
});

const vigilanteMapper = ({ target }) => {
	if (target.status === 'jailed') {
		return {
			source: { interactionResults: ['Your target was jailed last night!'] },
			target: { interactionResults: ['Someone tried to attack you last night, but you were jailed'] },
		};
	} else if (target.role === ROLES.GODFATHER
		|| target.role === ROLES.SERIAL_KILLER
		|| target.role === ROLES.EXECUTIONER) {
		return { source: { interactionResults: ['Your target\'s defense is too powerful!'] } };
	} else if (target.role === ROLES.FRAMER
		|| target.role === ROLES.MAFIOSO
		|| target.role === ROLES.JESTER) {
		return { target: { died: true }, source: { interactionResults: ['You killed your target!'] } };
	}
	return {
		source: {
			died: true,
			interactionResults: ['You committed suicide over the guilt of killing a townie!'],
		},
		target: { died: true },
	};
};

const defaultMapper = () => ({});

// params: {source, target}, interactions
const ROLES_MAPPER = {
	[ROLES.SHERIFF]: sheriffMapper,
	[ROLES.DOCTOR]: doctorMapper,
	[ROLES.INVESTIGATOR]: investigatorMapper,
	[ROLES.JAILOR]: jailorMapper,
	[ROLES.MEDIUM]: defaultMapper,
	[ROLES.GODFATHER]: killerMapper,
	[ROLES.FRAMER]: framerMapper,
	[ROLES.EXECUTIONER]: defaultMapper,
	[ROLES.ESCORT]: escortMapper,
	[ROLES.MAFIOSO]: killerMapper,
	[ROLES.BLACKMAILER]: blackmailerMapper,
	[ROLES.SERIAL_KILLER]: killerMapper,
	[ROLES.VIGILANTE]: vigilanteMapper,
	[ROLES.JESTER]: defaultMapper,
	[ROLES.SPY]: defaultMapper,
};

const _createGame = data => fromPromised(GameModel.create.bind(GameModel))(data);
const _createPlayers = data => fromPromised(PlayerModel.insertMany.bind(PlayerModel))(data);

const _updateLastWill = R.curry((playerDoc, lastWill) =>
	fromPromised(PlayerModel.update.bind(PlayerModel))(
		{ _id: playerDoc._id },
		{ $set: { lastWill } },
	));

const findGameByID = gameId => task((resolver) => {
	GameModel.findOne({ _id: gameId }).populate('players')
		.then(result => (result ? resolver.resolve(result) : resolver.reject()))
		.catch(err => resolver.reject(err));
});

const findPlayerByUsername = username => task((resolver) => {
	PlayerModel.findOne({ username, isPlaying: true })
		.then(result => (result ? resolver.resolve(result) : resolver.reject()))
		.catch(err => resolver.reject(err));
});

const findGameByPlayerId = playerId => task((resolver) => {
	GameModel.findOne({ players: playerId }).populate('players')
		.then(result => (result ? resolver.resolve(result) : resolver.reject()))
		.catch(err => resolver.reject(err));
});

// => number
const countPlayerAliveInGame = gameId => task((resolver) => {
	PlayerModel.find({ game: gameId, isPlaying: true, died: false }).count()
		.then(result => (result ? resolver.resolve(result) : resolver.reject()))
		.catch(err => resolver.reject(err));
});

const toPlayerObject = username => ({ username });

const addRoles =
	R.curry((players, roles) => players.map((val, index) => ({ ...val, role: roles[index] })));

const preprocess = usernames =>
	R.pipe(
		R.map(toPlayerObject),
		addRoles(R.__, shuffle(R.slice(0, usernames.length)(R.values(ROLES)))),
	)(usernames);

const updatePlayerGame = (playerDoc, gameId) =>
	fromPromised(PlayerModel.update.bind(PlayerModel))(
		{ _id: playerDoc._id },
		{ $set: { game: gameId } },
	);

const updateGamePhaseAndTime = R.curry((gameId, { phase, time }) =>
	fromPromised(GameModel.update.bind(GameModel))(
		{ _id: gameId },
		{ $set: { phase, time } },
	));

const NEXT_PHASE = {
	D: 'N',
	V: 'D',
	N: 'V',
};

const NEXT_PHASE_TIME = {
	D: 10, // if current phase is Day, next phase is Night, and night is 65s
	V: 10, // if current phase is Vote, next phase is Day, and day is 60s
	N: 30, // if current phase is Night, next phase is Vote, and vote is 40s
};

const generateNextPhase = (currentPhase) => {
	if (!currentPhase) {
		return { phase: 'D1', time: 15 /* 15 */ };
	}
	const [phase, ...numArr] = currentPhase;
	const preNum = parseInt(numArr.join(''), 10);
	const num = phase === 'N' ? preNum + 1 : preNum;
	return { phase: `${NEXT_PHASE[phase]}${num}`, time: NEXT_PHASE_TIME[phase] };
};

const createGame = usernames =>
	_createPlayers(preprocess(usernames))
		.map(trace('player docs: '))
		.map(playerDocs => playerDocs.map(R.prop('_id')))
		.chain(playerIds => _createGame({ players: playerIds, ...generateNextPhase() }))
		.chain(gameDoc => findGameByID(gameDoc._id)) // get out the players in game
		.map(trace('game doc with players: '))
		.map(gameDoc => gameDoc.toObject())
		.chain(gameDoc => waitAll([
			waitAll(gameDoc.players.map(player => updatePlayerGame(player, gameDoc._id))),
			sendEventToStateUpdateTopic('[Game] GAME_CREATED', gameDoc),
			sendEventToPhaseTopic('[Phase] START_PHASE', { ...generateNextPhase(), id: gameDoc._id }),
		]));

// how can we get current phase when user get Current Game State ? Save current State in game.
const getGameByUsername = username =>
	findPlayerByUsername(username)
		.map(trace('player doc found (by username): '))
		.map(R.prop('_id'))
		.chain(findGameByPlayerId)
		.map(trace('game doc found (by username): '));

const updateLastWill = ({ username, lastWill }) =>
	findPlayerByUsername(username)
		.chain(_updateLastWill(R.__, lastWill))
		.chain(() => getGameByUsername(username))
		.map(gameDoc => gameDoc.toObject())
		.map(trace('result after updateLastWill of player'))
		.chain(sendEventToStateUpdateTopic('[Game] GAME_UPDATED'));

// -------------------------------- Interactions
// let interactions = [];
// interaction format:
// 		{
// 			source: {
// 				username: 'vunguyenhung',
// 				role: 'Jailor',
// 			},
// 			target: {
// 				username: 'vunguyenhung2',
// 				role: 'Mafioso',
// 			},
// 		},

const clearStatus = () =>
	fromPromised(PlayerModel.updateMany.bind(PlayerModel))(
		{ isPlaying: true },
		{ $set: { status: null } },
	);

const handleInteraction = interaction =>
	of(Interactions.append(interaction))
		.map(() => Interactions.get(interaction.gameId))
		.map(ob => JSON.stringify(ob))
		.map(trace('interaction received: '));

const nightInteractionToChanges = ({ source, target }, _, interactions) => {
	const concatValues = (k, l, r) => (k === 'interactionResults' ? R.concat(l, r) : r);
	const changes = ROLES_MAPPER[source.role]({ source, target }, interactions); // => {source, target}
	return {
		source: R.mergeWithKey(concatValues, source, changes.source || {}),
		target: R.mergeWithKey(concatValues, target, changes.target || {}),
	};
};

// QUESTION: how to handle end game ?
// TODO: Implement a checkGameEnd function, then chain it after handleInteractions

const findTheMostFrequentTarget = (interactions) => {
	// source is unique
	const targets = R.map(R.prop('target'))(interactions);
	const targetVoteCount = R.countBy(R.prop('username'))(targets); // { 'vnhung1': 5, 'vnhung': 3 } || {}
	const [username, count] = R.toPairs(targetVoteCount)[0];
	const target = R.find(R.propEq('username', username))(targets);
	return { target, count };
};

const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const findRandomSourceByTargetUsername = (interactions, targetUsername) => {
	const sources = R.pipe(
		R.filter(R.pathEq(['target', 'username'], targetUsername)),
		R.map(R.prop('source')),
	)(interactions);
	return R.nth(randomIntFromInterval(0, sources.length))(sources);
};

const handleVoteInteractions = R.curry((interactions, playerAlive) => {
	if (interactions.length === 0) {
		return [];
	}
	const { target, count } = findTheMostFrequentTarget(interactions); // => {username :: String, count :: Number}
	if (count >= playerAlive / 2) {
		target.died = true;
		let source = {};
		if (target.role === ROLES.JESTER) {
			source = findRandomSourceByTargetUsername(interactions, target.username);
			source.died = true;
			source.interactionResults =
				R.append('You were killed by the hanged Jester!')(source.interactionResults);
		}
		return [{ target, source }];
	}
	return interactions.map(({ source, target }) => ({
		source: {
			...source,
			interactionResults:
				R.append('Not enough vote to lynch you target!')(source.interactionResults),
		},
		target,
	}));
});

const handleInteractions = interactions => interactions.map(nightInteractionToChanges);

const updatePlayerByUsername = userChanges =>
	fromPromised(PlayerModel.update.bind(PlayerModel))(
		{ username: userChanges.username, isPlaying: true },
		{ $set: userChanges },
	);

const updatePlayerChanges = interactionsChanges =>
	waitAll(interactionsChanges.map(({ source, target }) =>
		waitAll([updatePlayerByUsername(source), updatePlayerByUsername(target)])));

const startNextPhase = ({ phase, id }) =>
	of(generateNextPhase(phase))
		.chain(nextPhaseAndTime => waitAll([
			sendEventToPhaseTopic('[Phase] START_PHASE', { id, ...nextPhaseAndTime }),
			updateGamePhaseAndTime(id, nextPhaseAndTime)]))
		.chain(() => findGameByID(id).map(gameDoc => gameDoc.toObject()))
		.chain(sendEventToStateUpdateTopic('[Game] GAME_UPDATED'));

const handleDayEnded = ({ phase, id }) =>
	of(handleInteractions(Interactions.get(id)))
		.chain(updatePlayerChanges)
		.map(() => Interactions.clear())
		.chain(() => startNextPhase({ phase, id }));

const handleVoteEnded = ({ phase, id }) =>
	countPlayerAliveInGame(id)
		.map(trace('current player alive'))
		.map(handleVoteInteractions(Interactions.get(id)))
		.map(trace('handle Vote Interaction result: '))
		.chain(updatePlayerChanges)
		.map(trace('update player Changes Result: '))
		.map(() => Interactions.clear())
		.chain(() => startNextPhase({ phase, id }));

const handleNightEnded = ({ phase, id }) =>
	of(handleInteractions(Interactions.get(id)))
		.chain(updatePlayerChanges)
		.map(() => Interactions.clear())
		.chain(() => clearStatus())
		.chain(() => startNextPhase({ phase, id }));
// do this in front-end too

const handlePhaseEnded = ({ phase, id }) => {
	if (phase[0] === 'D') {
		return handleDayEnded({ phase, id });
	} else if (phase[0] === 'V') {
		return handleVoteEnded({ phase, id });
	}
	return handleNightEnded({ phase, id });
};

module.exports = {
	createGame,
	getGameByUsername,
	updateLastWill,
	handlePhaseEnded,
	handleInteraction,
};
