/*
3rd Party library imports
 */
const thunk = require('redux-thunk');
const { createLogger } = require('redux-logger');
const { applyMiddleware, createStore } = require('redux');

/*
Project file imports
 */
const { reducer } = require('./reducers');

const middlewares = [
  thunk,
  createLogger(),
  // ...more middleware goes here.
];

const store = createStore(reducer, applyMiddleware(...middlewares));

exports.store = store;
