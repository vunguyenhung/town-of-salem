/*
3rd Party library imports
 */
const http = require('http');

/*
Project file imports
 */
const createExpressApp = require('./app');
const { improvedEnv } = require('./env');
const StartupService = require('./infrastructures/services/startup.service');
const EventService = require('./infrastructures/services/event.service');

const server = http.createServer(createExpressApp(improvedEnv));

server.listen(improvedEnv.APP_PORT, () => {
  console.log(
    ('App is running at http://localhost:%d in %s mode'),
    improvedEnv.APP_PORT, improvedEnv.NODE_ENV,
  );
});

StartupService.run().then((result) => {
  console.log(result);
  EventService
    .start()
    .subscribe(publishResult => console.log(`Publish result: ${publishResult}`));
});
