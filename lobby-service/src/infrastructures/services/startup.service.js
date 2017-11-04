/*
3rd Party library imports
 */
const { waitAll } = require('folktale/concurrency/task');
const { createProducer } = require('kafka-node-driver');
const config = require('config');
/*
Project file imports
 */
// const { initConsumer } = require('../kafka/consumer');

const constructTasks = () => waitAll([
  createProducer(config.get('Kafka')),
  // initConsumer([{ topic: 'tos-lobby-events' }]),
  // ... more task goes here
]);

const run = () => constructTasks()
  .run()
  .promise();

exports.run = run;
