const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const path = require('path');
const compression = require('compression');
const http = require('http');

function run(env) {
  const app = express();

  app.set('port', env.APP_PORT || 3000);
  app.use(compression());
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/', (req, res) => {
    res.end('App is running');
  });

  /**
   * Error Handler. Provides full stack - remove for production
   */
  app.use(errorHandler());

  const server = http.createServer(app);

  server.listen(env.APP_PORT, () => {
    console.log(
      ('App is running at http://localhost:%d in %s mode'),
      env.APP_PORT, env.NODE_ENV,
    );
  });

  return server;
}

exports.run = run;
