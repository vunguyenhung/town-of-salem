/*
3rd Party library imports
 */
const http = require('http');

/*
Graphql-related imports
 */
const { execute, subscribe } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');

/*
Project file imports
 */
const createExpressApp = require('./app');
const { improvedEnv } = require('./env');
const { schema } = require('./infrastructures/graphql/schema');
const StartupService = require('./infrastructures/services/startup');
const EventService = require('./infrastructures/services/event');

const server = http.createServer(createExpressApp(improvedEnv));

server.listen(improvedEnv.APP_PORT, () => {
  SubscriptionServer.create(
    { execute, subscribe, schema },
    { server, path: '/graphql' },
  );
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
