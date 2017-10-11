const { Either } = require('ramda-fantasy');
const { identity } = require('ramda');

const eitherThrowErrorOrReturnIdentity = Either.either(
  (error) => { throw error; },
  identity,
);

exports.eitherThrowErrorOrReturnIdentity = eitherThrowErrorOrReturnIdentity;
