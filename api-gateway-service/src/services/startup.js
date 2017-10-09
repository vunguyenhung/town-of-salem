const { producerManager } = require('../kafka/producer');
const R = require('ramda');
const { MESSAGE } = require('./message');

const run = async () => {
  console.log(MESSAGE.START_UP_SERVICE_STARTING);

  const result = R.tryCatch(R.T, R.F)(await producerManager.createProducer());
  if (result) console.log(MESSAGE.KAFKA_PRODUCER_READY);
  else console.log(MESSAGE.KAFKA_PRODUCER_ERROR);

  console.log(MESSAGE.START_UP_SERVICE_STARTED);
};

exports.run = run;
