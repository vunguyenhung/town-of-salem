const database = require('../database');
const { waitAll } = require('folktale/concurrency/task');
const R = require('ramda');

// constructTasks::{MONGO_URL::String} -> Task [Result {[String]::Error} {[String]::String}]
const constructTasks = env => waitAll([
  database.connect(env.MONGO_URL),
  // more task here...
]);

// run::{MONGO_URL::String} -> Promise [{ [String]::String||Error }] :: Connect to Database
const run = env => constructTasks(env)
  .map(R.map(result => result.merge()))
  .run()
  .promise();

exports.run = run;
