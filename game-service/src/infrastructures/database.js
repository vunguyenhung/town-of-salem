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
	username: {
		type: String,
		index: true,
		unique: true,
	},
	password: String,
}, { timestamps: true });

const GameModel = mongoose.model('Game', GameSchema);

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
};
