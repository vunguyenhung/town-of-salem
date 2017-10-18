const mongoose = require('mongoose');
const R = require('ramda');
const { fromPromised, of } = require('folktale/concurrency/task');
const Result = require('folktale/result');

mongoose.Promise = global.Promise;

const connectPromise = url =>
  R.partial(mongoose.connect.bind(mongoose), [url, { useMongoClient: true }]);

// connect :: String -> Task Result Error Boolean
const connect = url =>
  fromPromised(connectPromise(url))()
    .map(() => Result.Ok({ MongoDB: 'Ok' }))
    .orElse(error => of(Result.Error({ MongoDB: error })));

module.exports = {
  connect,
};
