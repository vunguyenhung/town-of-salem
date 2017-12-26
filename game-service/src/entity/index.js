/* eslint-disable no-param-reassign,max-len */
/*
3rd Party library imports
 */
const { fromPromised } = require('folktale/concurrency/task');
const R = require('ramda');
const { task, waitAll, of } = require('folktale/concurrency/task');

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
	[ROLES.JAILOR]: jailorMapper, // buff
	[ROLES.MEDIUM]: defaultMapper, // can't do anything
	[ROLES.GODFATHER]: killerMapper,
	[ROLES.FRAMER]: framerMapper,
	[ROLES.EXECUTIONER]: defaultMapper, // can't do anything
	[ROLES.ESCORT]: escortMapper,
	[ROLES.MAFIOSO]: killerMapper,
	[ROLES.BLACKMAILER]: blackmailerMapper, // can change target's status at daytime
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
	D: 35, // if current phase is Day, next phase is Night, and night is 65s
	V: 30, // if current phase is Vote, next phase is Day, and day is 60s
	N: 20, // if current phase is Night, next phase is Vote, and vote is 40s
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

// => Don't need to get data from DB.
// => Can sort && replace interactions

const clearStatusAndInteractionResults = () =>
	fromPromised(PlayerModel.updateMany.bind(PlayerModel))(
		{ isPlaying: true },
		{ $set: { status: null } },
	);

const handleInteraction = interaction =>
	of(Interactions.append(interaction))
		.map(() => Interactions.get(interaction.gameId))
		.map(ob => JSON.stringify(ob))
		.map(trace('interaction received: '));

// TODO: write test for this!
const nightInteractionToChanges = ({ source, target }, _, interactions) => {
	const concatValues = (k, l, r) => (k === 'interactionResults' ? R.concat(l, r) : r);
	const changes = ROLES_MAPPER[source.role]({ source, target }, interactions); // => {source, target}
	return {
		source: R.mergeWithKey(concatValues, source, changes.source || {}),
		// bug here. It only source's interactionResults from client with the latest interactionResults that we generated
		target: R.mergeWithKey(concatValues, target, changes.target || {}),
	};
};

// QUESTION: how to handle end game ?
// TODO: Implement a checkGameEnd function, then chain it after handleInteractions

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

// split it into
//  handleDayPhaseEnded - handleDayInteractions
//  handleVotePhaseEnded - handleVoteInteractions
//  handleNightPhaseEnded - handleInteractions

const handleDayEnded = ({ phase, id }) =>
	of(handleInteractions(Interactions.get(id)))
		.chain(updatePlayerChanges)
		.map(() => Interactions.clear())
		.chain(() => startNextPhase({ phase, id }));

const handleVoteEnded = ({ phase, id }) =>
	of(handleInteractions(Interactions.get(id)))
		.chain(updatePlayerChanges)
		.map(() => Interactions.clear())
		.chain(() => startNextPhase({ phase, id }));

// INFO: front-end save status for us.
const handleNightEnded = ({ phase, id }) =>
	of(handleInteractions(Interactions.get(id)))
		.chain(updatePlayerChanges)
		.map(() => Interactions.clear())
		.chain(() => clearStatusAndInteractionResults())
		.chain(() => startNextPhase({ phase, id })); // INFO: this get data from DB
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
