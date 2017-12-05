/*
3rd Party library imports
 */
const thunk = require('redux-thunk').default;
const { createLogger } = require('redux-logger');
const { applyMiddleware, createStore } = require('redux');

/*
Project file imports
 */
const { reducer, getLobbyByUsername } = require('./reducers');

const middlewares = [
  thunk,
  createLogger(),
  // ...more middleware goes here.
];

const store = createStore(reducer, applyMiddleware(...middlewares));

module.exports = {
	store,
	getLobbyByUsername,
};
