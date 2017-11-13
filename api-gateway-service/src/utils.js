const R = require('ramda');
const log = require('debug')('src:util');

const trace = R.curry((message, something) => {
  log(message, something);
  return something;
});

module.exports = {
  trace,
};
