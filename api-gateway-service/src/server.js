const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const path = require('path');
const compression = require('compression');
const http = require('http');

const apolloServerExpress = require('apollo-server-express');
const { schema } = require('./graphql/schema');
const { execute, subscribe } = require('graphql');

const { SubscriptionServer } = require('subscriptions-transport-ws');

const { formatError } = require('apollo-errors');

const startupService = require('./services/startup');

function run(env) {
  const app = express();

  app.set('port', env.APP_PORT || 3000);
  app.use(compression());
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, 'public')));

  /**
   * Error Handler. Provides full stack - remove for production
   */
  app.use(errorHandler());

  app.get('/', (req, res) => {
    res.end('App is running');
  });

  app.use('/graphql', apolloServerExpress.graphqlExpress({
    formatError,
    schema,
  }));

  app.use('/graphiql', apolloServerExpress.graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: env.GRAPHQL_SUBSCRIPTION_ENDPOINT,
  }));

  startupService.run();

  const server = http.createServer(app);

  server.listen(env.APP_PORT, () => {
    SubscriptionServer.create(
      { execute, subscribe, schema },
      { server, path: '/graphql' },
    );
    console.log(
      ('App is running at http://localhost:%d in %s mode'),
      env.APP_PORT, env.NODE_ENV,
    );
  });

  return server;
}

exports.run = run;
