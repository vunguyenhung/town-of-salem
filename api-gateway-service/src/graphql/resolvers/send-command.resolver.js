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

const trace = (something) => {
  console.log(something);
  return something;
};

// we need to send request to authentication-service
// they will have their own mutation
// Game Command will demand token and game ID.
// this command will only serve ingame command
const sendCommand = baseResolver.createResolver((obj, { command }) =>
  commandToTask(command)
    .chain(publish(R.__, 0)) // use producer at index 0 by default
    .map(trace) // { 'tos-some-topic': { '0': 7 } }: Topic: tos-some-topic, Partition 0, offset 7
    .run()
    .promise());

// { 'tos-some-topic': { '0': 7 } }
// -> tos-some-topic-0-7

// { topic : {partition: offset} }
exports.sendCommand = {
  Mutation: {
    sendCommand,
  },
};
