/*
3rd Party library imports
 */
const mongoose = require('mongoose');
const R = require('ramda');
const { fromPromised } = require('folktale/concurrency/task');

/*
Project file imports
 */

const MessageSchema = new mongoose.Schema({
	message: String,
	source: String,
	target: String,
	game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
}, { timestamps: true });

const MessageModel = mongoose.model('Message', MessageSchema);

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
	MessageModel,
};
