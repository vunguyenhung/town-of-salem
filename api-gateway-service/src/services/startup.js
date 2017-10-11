const { producerManager } = require('../kafka/producer');
const R = require('ramda');
const { MESSAGE } = require('./message');

const { Either } = require('ramda-fantasy');

const eitherThrowErrorOrReturnIdentity = Either.either(
  (error) => { throw error; },
  R.identity,
);

const run = () => {
  console.log(MESSAGE.START_UP_SERVICE_STARTING);

  const result = eitherThrowErrorOrReturnIdentity(producerManager.createProducer());
  console.log(result);

  console.log(MESSAGE.START_UP_SERVICE_STARTED);
};

exports.run = run;
