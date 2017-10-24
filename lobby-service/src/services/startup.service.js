/*
3rd Party library imports
 */
const { waitAll } = require('folktale/concurrency/task');
const R = require('ramda');

/*
Project file imports
 */
const { initProducer } = require('../kafka/producer');
const { initConsumer } = require('../kafka/consumer');

const constructTasks = () => waitAll([
  initProducer(),
  initConsumer([{ topic: 'tos-lobby-events' }]),
  // ... more task goes here
]);

const run = () => constructTasks()
  .map(R.map(result => result.merge()))
  .run()
  .promise();

exports.run = run;
