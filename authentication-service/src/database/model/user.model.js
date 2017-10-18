const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    index: true,
    unique: true,
  },
  password: String,
}, { timestamps: true });

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
