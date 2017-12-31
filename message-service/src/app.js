/*
3rd Party library imports
 */
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const compression = require('compression');

/*
Project file imports
 */
const rest = require('./rest');

const createExpressApp = () => {
	const app = express();

	app.use(compression());
	app.use(logger('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

	app.use(errorHandler());

	app.use('/', rest);

	return app;
};

module.exports = createExpressApp();
