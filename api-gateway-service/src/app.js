const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const path = require('path');
const compression = require('compression');

const apolloServerExpress = require('apollo-server-express');
const { schema } = require('./graphql/schema');

const { formatError } = require('apollo-errors');

const createExpressApp = (env) => {
  const app = express();

  app.set('port', env.APP_PORT || 3000);
  app.use(compression());
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, 'public')));

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

  return app;
};

module.exports = createExpressApp;
