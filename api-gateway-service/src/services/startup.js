/*
3rd Party library imports
 */
const { waitAll } = require('folktale/concurrency/task');
const R = require('ramda');

/*
Project file imports
 */
const producerManager = require('../kafka/producer');

const constructTaks = () => waitAll([
  producerManager.initProducer(),
  // ... more task goes here
]);

const run = () => constructTaks()
  .map(R.map(result => result.merge()))
  .run()
  .promise();

exports.run = run;
