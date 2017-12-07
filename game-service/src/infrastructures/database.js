/*
3rd Party library imports
 */
const mongoose = require('mongoose');
const R = require('ramda');
const { fromPromised } = require('folktale/concurrency/task');

/*
Project file imports
 */

const GameSchema = new mongoose.Schema({
	players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
}, { timestamps: true });

const PlayerSchema = new mongoose.Schema({
	username: String,
	died: { type: Boolean, default: false },
	lastWill: String,
	isPlaying: { type: Boolean, default: true },
	game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
}, { timestamps: true });

const GameModel = mongoose.model('Game', GameSchema);

const PlayerModel = mongoose.model('Player', PlayerSchema);

mongoose.Promise = global.Promise;

const connectPromise = url =>
	R.partial(mongoose.connect.bind(mongoose), [url, { useMongoClient: true }]);

// connect :: String -> Task Result Error Boolean
const connect = url =>
	fromPromised(connectPromise(url))()
		.map(() => ({ MongoDB: 'Ok' }))
		.orElse(error => ({ MongoDB: error }));

module.exports = {
	connect,
	GameModel,
	PlayerModel,
};
