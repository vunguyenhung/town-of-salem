/*
3rd Party library imports
 */
const http = require('http');
const log = require('debug')('src:index');
const config = require('config');

/*
Project file imports
 */
const app = require('./app');
const StartupTasks = require('./infrastructures/startup-tasks');

const server = http.createServer(app);

server.listen(config.get('App.port'), () => {
  log(
    ('App is running at http://localhost:%d in %s mode'),
    config.get('App.port'), config.get('NODE_ENV'),
  );
});

StartupTasks.start()
  .run()
  .promise()
  .then((onMessage) => {
    onMessage.subscribe(message => log('Message received', message));
    //    onMessage.subscribe(EventController.processMessage))
  })
  .catch(log); // Just log the error out
