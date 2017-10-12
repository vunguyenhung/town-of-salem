const { KafkaClient, Consumer } = require('kafka-node');
const { CONFIG } = require('./config');
const { storage } = require('./storage');
const { MESSAGE } = require('../services/message');

const { Either } = require('ramda-fantasy');

const { Left, Right } = Either;

const R = require('ramda');

const Rx = require('rxjs');

// TODO: implement manual commit feature
const createConsumerManager = () => {
  const _createConsumer = () => {
    const client = new KafkaClient(CONFIG.CLIENT);
    return new Consumer(client, CONFIG.CONSUMER_TOPICS, CONFIG.CONSUMER);
  };

  /**
   * Create a Kafka Consumer. Then push it to Kafka instance storage.
   *
   * @return {Either} Either object contains:
   *  Left{Error} if the consumer creation process is failed
   *  Right{MESSAGE.KAFKA_CONSUMER_READY} if the consumer creation process is successfully
   */
  const createConsumer = () => R.tryCatch(
    (createdConsumer) => {
      storage.consumers.push(createdConsumer);
      return Right(MESSAGE.KAFKA_CONSUMER_READY);
    },
    error => Left(error),
  )(_createConsumer());

  // NOTICE: The time we create consumer is the time Kafka client starts consuming message
  // and automatically commit whenever a message comes with 2000ms delay
  const onMessage = (consumerIndex = 0) =>
    Rx.Observable.fromEvent(storage.consumers[consumerIndex], 'message');

  return {
    createConsumer,
    onMessage,
  };
};

exports.consumerManager = createConsumerManager();
