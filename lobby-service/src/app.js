const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const compression = require('compression');

const createExpressApp = () => {
  const app = express();

  app.use(compression());
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(errorHandler());

  app.get('/', (req, res) => {
    res.end('App is running');
  });

  return app;
};

module.exports = createExpressApp();
