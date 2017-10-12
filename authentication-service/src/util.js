const { Either } = require('ramda-fantasy');
const { identity } = require('ramda');

const eitherThrowErrorOrReturnIdentity = Either.either((error) => { throw error; }, identity);

module.exports = {
  eitherThrowErrorOrReturnIdentity,
};