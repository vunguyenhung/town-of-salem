const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const connect = url => mongoose.connect(url, { useMongoClient: true });

const drop = () => mongoose.connection.db.dropDatabase();

const disconnect = () => mongoose.disconnect();

module.exports = {
  connect,
  drop,
  disconnect,
};
