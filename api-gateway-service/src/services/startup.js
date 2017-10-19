const { producerManager } = require('../kafka/producer');
const { consumerManager } = require('../kafka/consumer');
const { MESSAGE } = require('./message');

const { eitherThrowErrorOrReturnIdentity } = require('./utils');

const { eventProcessor } = require('./event');

// Refactor producer and consumer to use folktale
// then create api to check availability of others services in this startup service
const run = () => {
  console.log(MESSAGE.START_UP_SERVICE_STARTING);

  const producerCreationResult = eitherThrowErrorOrReturnIdentity(producerManager.createProducer());
  console.log(producerCreationResult);

  const consumeCreationResult = eitherThrowErrorOrReturnIdentity(consumerManager.createConsumer());
  console.log(consumeCreationResult);

  eventProcessor.start();
  console.log(MESSAGE.EVENT_PROCESSOR_STARTED);

  console.log(MESSAGE.START_UP_SERVICE_STARTED);
};

exports.run = run;
