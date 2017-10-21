/*
3rd Party library imports
 */
const R = require('ramda');
const Task = require('folktale/concurrency/task');
const Result = require('folktale/result');
const { Producer, KafkaClient } = require('kafka-node');

/*
Project file imports
 */
const { CONFIG } = require('./config');
const { storage } = require('./storage');
const { PublishError } = require('../graphql/errors');

const TOPICS = {
  SOME_TOPIC: 'tos-some-topic',
};

// createProducerInstance :: () -> Task Producer
const createProducerInstance = () => Task.task((r) => {
  const client = new KafkaClient(CONFIG.CLIENT);
  const newProducer = new Producer(client);
  r.resolve(newProducer);
});

// pushProducerToStorage :: Producer -> Task Error Producer
const pushProducerToStorage = producer =>
  Task.task(r =>
    R.tryCatch(
      () => r.resolve(producer),
      e => r.reject(e),
    )(storage.producers.push(producer)));

// onProducerReady :: Producer -> Task Producer
const onProducerReady = producer =>
  Task.task(r => producer.on('ready', () => r.resolve(producer)));

const initProducer = () => createProducerInstance()
  .chain(pushProducerToStorage)
  .chain(onProducerReady)
  .map(() => Result.Ok({ KafkaProducer: 'Ok' }))
  .orElse(error => Task.of(Result.Error({ KafkaProducer: error })));

// getProducer :: Number -> Task Error Producer
const getProducer = index => Task.task((r) => {
  const producer = storage.producers[index];
  return producer ? r.resolve(producer) : r.reject(new PublishError({
    message: 'Producer not found',
  }));
});

// _publish :: Message -> Producer -> Task Error String
const _publish = R.curry((message, producer) =>
  Task.task((r) => {
    producer.send([message], (err, data) =>
      (err ? r.reject(err) : r.resolve(`Command ${R.toString(data)} sent`)));
  }));

// publish :: Message -> Number -> Task Error String
const publish = R.curry((message, producerIndex = 0) =>
  getProducer(producerIndex).chain(_publish(message)));

module.exports = {
  initProducer,
  publish,
  TOPICS,
};
