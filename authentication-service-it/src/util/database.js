const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const connect = url => mongoose.connect(url, { useMongoClient: true });

const drop = () => mongoose.connection.db.dropDatabase();

const disconnect = () => mongoose.disconnect();

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    index: true,
    unique: true,
  },
  password: String,
}, { timestamps: true });

const UserModel = mongoose.model('User', UserSchema);

module.exports = {
  connect,
  drop,
  disconnect,
  model: UserModel,
};
