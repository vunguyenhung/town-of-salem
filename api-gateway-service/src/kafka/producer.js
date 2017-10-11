// to use producer: require('...').instance;
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

  const createProducer = () => {
    const createdProducer = _createProducer();
    storage.producers.push(createdProducer);
    return onProducerReady(createdProducer);
  };

  const _publishMessage = (producer, message) =>
    promisify(producer.send.bind(producer))(message);

  const publishMessageAsync = async (message, index = 0) =>
    _publishMessage(storage.producers[index], message);

  const createKafkaMessage = ({ topic, events }) => [{
    topic,
    messages: events.map(JSON.stringify),
  }];

  const publishMessage = msg => R.tryCatch(
    () => Right(MESSAGE.KAFKA_PRODUCER_SENT),
    ({ message }) => Left(new PublishEventsError(message)),
  )(publishMessageAsync(msg));

  const publishEventsToKafka = eventWrapper => R.pipe(
    createKafkaMessage,
    publishMessage,
  )(eventWrapper);

  return {
    createProducer,
    publishEventsToKafka,
  };
};

exports.producerManager = createProducerManager();
