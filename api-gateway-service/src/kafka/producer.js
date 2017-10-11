const { CONFIG } = require('./config');
const { Producer, KafkaClient } = require('kafka-node');
const { storage } = require('./storage');
const { MESSAGE } = require('../services/message');
const { createError } = require('apollo-errors');

const { promisify } = require('util');

const R = require('ramda');
const { Either } = require('ramda-fantasy');

const { Left, Right } = Either;

const PublishEventsError = createError('PublishEventsError', {
  message: MESSAGE.DEFAULT_PUBLISH_EVENTS_ERROR,
});

const createProducerManager = () => {
  const onProducerReady = producer => new Promise((resolve) => {
    producer.on('ready', () => {
      resolve(true);
    });
  });

  const _createProducer = () => {
    const client = new KafkaClient(CONFIG.CLIENT);
    return new Producer(client);
  };

  const _publishMessage = (producer, message) =>
    promisify(producer.send.bind(producer))(message);

  // Hide the async things here, all other places process this function as a sync function
  // `await` keyword is not necessary in return statement
  const publishMessageAsync = async (message, index = 0) =>
    _publishMessage(storage.producers[index], message);

  const createKafkaMessage = ({ topic, events }) => [{
    topic,
    messages: events.map(JSON.stringify),
  }];

  const publishMessages = messages => R.tryCatch(
    () => Right(MESSAGE.KAFKA_PRODUCER_SENT),
    error => Left(new PublishEventsError(error.message)),
  )(publishMessageAsync(messages));

  /**
   * `publishEventsToKafka` receives eventWrapper,
   * create Kafka messages based on eventWrapper then send created messages to Kafka.
   *
   * @param eventWrapper
   * @return {Either} Either object contains:
   *    Left(PublishEventsError) if publishing failed,
   *    Right(MESSAGE.KAFKA_PRODUCER_SENT) if publishing successfully
   */
  const publishEventsToKafka = eventWrapper => R.pipe(
    createKafkaMessage,
    publishMessages,
  )(eventWrapper);

  // Hide the async things here, all other places process this function as a sync function
  // `await` keyword is not necessary in return statement
  const onProducerReadyAsync = async producer => onProducerReady(producer);

  const createProducer = () => {
    const createdProducer = _createProducer();
    storage.producers.push(createdProducer);
    return R.tryCatch(
      () => Right(MESSAGE.KAFKA_PRODUCER_READY),
      error => Left(error),
    )(onProducerReadyAsync(createdProducer));
  };

  return {
    createProducer,
    publishEventsToKafka,
  };
};

exports.producerManager = createProducerManager();
