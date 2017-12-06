/* eslint-disable global-require */
/*
3rd Party library imports
 */
const R = require('ramda');

const createTrace = namespace => R.curry((message, something) => {
	require('debug')(namespace)(message, something);
	return something;
});

module.exports = {
	createTrace,
};
