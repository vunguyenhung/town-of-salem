const database = require('../database');
const { waitAll } = require('folktale/concurrency/task');

// constructTasks::{MONGO_URL::String} -> Task [Result Error String]
const constructTasks = env => waitAll([
  database.connect(env.MONGO_URL),
  // more task here...
]);

// run::{MONGO_URL::String} -> Promise [{ [String]::String||Error }]::Connect to DB
const run = env => constructTasks(env)
  .map(results => results.map(result => result.merge()))
  .run()
  .promise();

exports.run = run;
