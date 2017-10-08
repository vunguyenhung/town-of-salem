const { producerManager } = require('../kafka/producer');
const R = require('ramda');

const run = async () => {
  console.log('------STARTING STARTUP SERVICE------');

  const result = R.tryCatch(R.T, R.F)(await producerManager.createProducer());
  if (result) console.log('Kafka Producer ready!!');
  else console.log('Failed to create Producer !');

  console.log('------STARTUP SERVICE STARTED------');
};

exports.run = run;
