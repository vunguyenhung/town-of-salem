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
const StartupService = require('./infrastructures/services/startup.service');
// const EventService = require('./infrastructures/services/event.service');

const server = http.createServer(app);

server.listen(config.get('App.port'), () => {
  log(
    ('App is running at http://localhost:%d in %s mode'),
    config.get('App.port'), config.get('NODE_ENV'),
  );
});

StartupService.run().then(log);

// TODO: fix consumer
// StartupService.run()
//   .then((result) => {
//     log(result);
//     // EventService
//     //   .start()
//     //   .subscribe(publishResult => console.log(`Publish result: ${publishResult}`));
//   });
