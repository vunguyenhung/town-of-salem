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

const trace = createTrace('src:entity');

const ROLES = [
	'Sheriff',
	'Doctor',
	'Investigator',
	'Jailor',
	'Medium',
	'Godfather',
	'Framer',
	'Executioner',
	'Escort',
	'Mafioso',
	'Lookout',
	'Serial Killer',
	'Vigilante',
	'Jester',
	'Spy',
];

const _createGame = data => fromPromised(GameModel.create.bind(GameModel))(data);
const _createPlayers = data => fromPromised(PlayerModel.insertMany.bind(PlayerModel))(data);

const _updateLastWill = R.curry((playerDoc, lastWill) =>
	fromPromised(PlayerModel.update.bind(PlayerModel))(
		{ _id: playerDoc._id },
		{ $set: { lastWill } },
	));

const findGameByID = gameId => task((resolver) => {
	GameModel.findOne({ _id: gameId }).populate('players')
		.then(result => resolver.resolve(result))
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

// assign role to users
// should have assign role step
// to assign role
const toPlayerObject = username => ({ username });

const addRoles =
	R.curry((players, roles) => players.map((val, index) => ({ ...val, role: roles[index] })));

const preprocess = usernames =>
	R.pipe(
		R.map(toPlayerObject),
		addRoles(R.__, shuffle(R.slice(0, usernames.length)(ROLES))),
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
	D: 'V',
	V: 'N',
	N: 'D', // num + 1
};

const NEXT_PHASE_TIME = {
	D: 15, // if current phase is Day, next phase is vote, and vote is 15s
	V: 60, // if current phase is Vote, next phase is Night, and vote is 60s
	N: 40, // if current phase is Night, next phase is Day, and vote is 40s
};

// V - 15s
// D - 40s
// N - 60s
const generateNextPhase = (currentPhase) => {
	if (!currentPhase) {
		return { phase: 'D1', time: 15 };
	}
	if (currentPhase === 'D1') {
		return { phase: 'N1', time: 60 };
	}
	const num = currentPhase[0] === 'N' ? +currentPhase[1] + 1 : +currentPhase[1];
	return { phase: `${NEXT_PHASE[currentPhase[0]]}${num}`, time: NEXT_PHASE_TIME[currentPhase[0]] };
};

const createGame = usernames =>
	_createPlayers(preprocess(usernames))
		.map(trace('player docs: '))
		.map(playerDocs => playerDocs.map(R.prop('_id')))
		.chain(playerIds => _createGame({ players: playerIds, ...generateNextPhase() }))
		.chain(gameDoc => findGameByID(gameDoc._id)) // players: [playerDoc]
		.map(trace('game doc: '))
		.chain(gameDoc =>
			waitAll(gameDoc.players.map(player => updatePlayerGame(player, gameDoc._id)))
				.map(() => gameDoc))
		.chain(gameDoc =>
			sendEventToStateUpdateTopic(
				'[Game] GAME_CREATED',
				gameDoc.toObject(),
			).map(() => gameDoc))
		.chain(gameDoc =>
			sendEventToPhaseTopic('[Phase] START_PHASE', { ...generateNextPhase(), id: gameDoc._id }));
// D1 is 15s long
// about the client ?
// Error: Only pending deferreds can be rejected, this deferred is already rejected.

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
		.map(trace('result after updateLastWill of player'))
		.chain(gameDoc =>
			sendEventToStateUpdateTopic('[Game] GAME_UPDATED', gameDoc.toObject()));

// -------------------------------- Interactions

const handlePhaseEnded = ({ phase, id }) =>
	of(generateNextPhase(phase))
		.chain(nextPhaseAndTime =>
			sendEventToPhaseTopic('[Phase] START_PHASE', { ...nextPhaseAndTime, id })
				.map(() => nextPhaseAndTime))
		.chain(updateGamePhaseAndTime(id))
		.chain(() => findGameByID(id))
		.chain(gameDoc => sendEventToStateUpdateTopic('[Game] GAME_UPDATED', gameDoc.toObject()));

module.exports = {
	createGame,
	getGameByUsername,
	updateLastWill,
	findPlayerByUsername,
	handlePhaseEnded,
};
