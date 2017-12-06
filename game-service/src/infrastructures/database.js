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
	users: [mongoose.Schema.Types.Mixed],
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

const create = data => fromPromised(GameModel.create.bind(GameModel))(data);

module.exports = {
	connect,
	GameModel,
	create,
};
