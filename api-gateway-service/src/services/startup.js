const { producerManager } = require('../kafka/producer');
const { MESSAGE } = require('./message');

const { eitherThrowErrorOrReturnIdentity } = require('./utils');

const run = () => {
  console.log(MESSAGE.START_UP_SERVICE_STARTING);

  const result = eitherThrowErrorOrReturnIdentity(producerManager.createProducer());
  console.log(result);

  console.log(MESSAGE.START_UP_SERVICE_STARTED);
};

exports.run = run;
