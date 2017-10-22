/*
3rd Party library imports
 */
const R = require('ramda');

/*
Project file imports
 */
const { baseResolver } = require('./base.resolver');
const { commandToTask } = require('../../services/command');
const { publish } = require('../../kafka/producer');

// Game Command will demand token.
const sendCommand = baseResolver.createResolver((obj, { command }) =>
  commandToTask(command)
    .chain(publish(R.__, 0)) // use producer at index 0 by default
    .run()
    .promise());

exports.sendCommand = {
  Mutation: {
    sendCommand,
  },
};
