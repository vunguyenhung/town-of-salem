const { Either } = require('ramda-fantasy');
const { identity } = require('ramda');

const eitherThrowErrorOrReturnIdentity = Either.either(
  (error) => { throw error; },
  identity,
);

const logThenReturnIdentity = (something) => {
  console.log(something);
  return something;
};

exports.eitherThrowErrorOrReturnIdentity = eitherThrowErrorOrReturnIdentity;

exports.logThenReturnIdentity = logThenReturnIdentity;
