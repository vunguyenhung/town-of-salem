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

const constructTaks = () => waitAll([
  initProducer(),
  initConsumer([{ topic: 'tos-some-topic' }]),
  // ... more task goes here
]);

const run = () => constructTaks()
  .map(R.map(result => result.merge()))
  .run()
  .promise();

exports.run = run;
