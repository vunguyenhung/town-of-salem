/*
3rd Party imports
 */
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const compression = require('compression');
const apolloServerExpress = require('apollo-server-express');
const { formatError } = require('apollo-errors');
const config = require('config');
const cors = require('cors');

/*
Project file imports
 */
const { schema } = require('./infrastructures/graphql/schema');

const createExpressApp = () => {
  const app = express();

  app.use(compression());
  app.use(cors());
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

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
    subscriptionsEndpoint: config.get('GraphQLSubscriptionEndpoint'),
  }));

  return app;
};

module.exports = createExpressApp();
