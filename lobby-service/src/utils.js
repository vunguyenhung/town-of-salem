const R = require('ramda');
const log = require('debug')('src:util');

const trace = R.curry((message, something) => {
  log(message, something);
  return something;
});

const notNil = R.complement(R.isNil);

module.exports = {
  trace,
  notNil,
};
