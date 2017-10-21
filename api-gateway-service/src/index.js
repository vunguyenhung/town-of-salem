/*
Third Party library imports
 */
const dotenv = require('dotenv');
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
const { schema } = require('./graphql/schema');
const StartupService = require('./services/startup');

dotenv.config({ path: '.env' });

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

StartupService.run().then(result => console.log(result));
