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
	LOOKOUT: 'Lookout',
	SERIAL_KILLER: 'Serial Killer',
	VIGILANTE: 'Vigilante',
	JESTER: 'Jester',
	SPY: 'Spy',
};

const sheriffMapper = ({ target }) => {
	if (target.status === 'jailed') {
		return { source: { interactionResults: ['Your target was jailed last night!'] } };
	} else if (target.status === 'framed' || target.role === ROLES.MAFIOSO) {
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

const defaultMapper = ({ source, target }) => ({});

// params: {source, target}, interactions
const ROLES_MAPPER = {
	[ROLES.SHERIFF]: sheriffMapper,
	[ROLES.DOCTOR]: doctorMapper,
	[ROLES.INVESTIGATOR]: defaultMapper,
	JAILOR: 'Jailor',
	MEDIUM: 'Medium',
	GODFATHER: 'Godfather',
	FRAMER: 'Framer',
	EXECUTIONER: 'Executioner',
	ESCORT: 'Escort',
	MAFIOSO: 'Mafioso',
	LOOKOUT: 'Lookout',
	SERIAL_KILLER: 'Serial Killer',
	VIGILANTE: 'Vigilante',
	JESTER: 'Jester',
	SPY: 'Spy',
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

const clearInteractionResultsAndStatus = () =>
	fromPromised(PlayerModel.updateMany.bind(PlayerModel))(
		{},
		{ $set: { interactionResults: null, status: null } },
	);

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

// TODO: refactor this, we just need update() method.
const updateGamePhaseAndTime = R.curry((gameId, { phase, time }) =>
	fromPromised(GameModel.update.bind(GameModel))(
		{ _id: gameId },
		{ $set: { phase, time } },
	));

const NEXT_PHASE = {
	D: 'V',
	V: 'N',
	N: 'D', // num + 1
};

const NEXT_PHASE_TIME = {
	D: 15, // if current phase is Day, next phase is vote, and vote is 15s
	V: 30, // if current phase is Vote, next phase is Night, and vote is 60s
	N: 40, // if current phase is Night, next phase is Day, and vote is 40s
};

const generateNextPhase = (currentPhase) => {
	if (!currentPhase) {
		return { phase: 'D1', time: 15 /* 15 */ };
	}
	if (currentPhase === 'D1') {
		return { phase: 'N1', time: 30 /* 60 */ };
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

// each game has its own interactions.
const handleInteraction = interaction =>
	of(Interactions.append(interaction))
		.map(() => Interactions.get(interaction.gameId))
		.map(ob => JSON.stringify(ob))
		.map(trace('interaction received: '));
// handlePhaseEnded
//  .getInteractions()
//  .

// TODO: implement handleInteraction event from api gateway

// gameRule will return $set object in update() method of mongoose. Then we'll update in DB.

// interactionToChanges :: { source :: { username, status, died, role }, target :: { username, status, died, role } }
// -> { source :: { username, status, died, interactionResults }, target: { username, status, died } }
// update source && target
const interactionToChanges = ({ source, target }, _, interactions) => {
	const concatValues = (k, l, r) => (k === 'interactionResults' ? R.concat(l, r) : r);
	const changes = ROLES_MAPPER[source.role]({ source, target }, interactions); // {source, target}
	return {
		source: R.mergeWithKey(concatValues, source, changes.source || {}),
		target: R.mergeWithKey(concatValues, target, changes.target || {}),
	};
};

// QUESTION: how to handle end game ?
// TODO: Implement a checkGameEnd function, then chain it after handleInteractions

const handleInteractions = interactions => interactions.map(interactionToChanges);

// updatePlayer :: (criteria :: { game :: String, username :: String }, changes :: { username :: String, died :: Boolean, status :: String, interactionResults :: [String]})
const updatePlayerByUsername = userChanges =>
	fromPromised(PlayerModel.update.bind(PlayerModel))(
		{ username: userChanges.username, isPlaying: true },
		{ $set: userChanges },
	);

// update both source and target
// (changes :: [{ source, target }], gameId: String)
const updatePlayerChanges = interactionsChanges =>
	waitAll(interactionsChanges.map(({ source, target }) =>
		waitAll([updatePlayerByUsername(source), updatePlayerByUsername(target)])));

// just update once.

// handlePhaseEnded({ phase, id })
//  handleInteractions(Interactions.get(id)) // -> [{source, target}]
//  updatePlayerChanges() // Update Database
//    handleEndGame() // later
//  startNextPhase

const startNextPhase = ({ phase, id }) =>
	of(generateNextPhase(phase))
		.chain(nextPhaseAndTime => waitAll([
			sendEventToPhaseTopic('[Phase] START_PHASE', { id, ...nextPhaseAndTime }),
			updateGamePhaseAndTime(id, nextPhaseAndTime)]))
		.chain(() => findGameByID(id).map(gameDoc => gameDoc.toObject()))
		.chain(sendEventToStateUpdateTopic('[Game] GAME_UPDATED'));

// startNextPhase
//  generateNextPhase
//  updateGamePhaseAndTime
//  sendEventToPhaseTopic('[Phase] START_PHASE')
//  sendEventToStateUpdateTopic('[Phase] GameUpdated')

// const clearStatusAndInteractionResults = () =>

const handlePhaseEnded = ({ phase, id }) =>
	clearInteractionResultsAndStatus()
		.map(() => handleInteractions(Interactions.get(id)))
		.map(trace('handleInteractions result: '))
		.chain(updatePlayerChanges)
		.map(trace('updatePlayerChanges esult: '))
		.map(() => Interactions.clear())
		.chain(() => startNextPhase({ phase, id }));

module.exports = {
	createGame,
	getGameByUsername,
	updateLastWill,
	handlePhaseEnded,
	handleInteraction,
};
