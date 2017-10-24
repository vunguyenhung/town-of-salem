/*
3rd Party library imports
 */
const { KafkaClient, Consumer } = require('kafka-node');
const Task = require('folktale/concurrency/task');
const Result = require('folktale/result');

const R = require('ramda');
const Rx = require('rxjs');

/*
Project file imports
 */
const { CONFIG } = require('./config');
const { storage } = require('./storage');

// Topic :: {topic :: String}
// createConsumerInstance :: Array Topic -> Task Error Consumer
const createConsumerInstance = topics =>
  Task.task((r) => {
    const client = new KafkaClient(CONFIG.CLIENT);
    const consumer = new Consumer(client, topics, CONFIG.CONSUMER);
    let rejected = false;

    consumer.on('error', (err) => {
      r.reject(err);
      rejected = true;
    });

    // wait for 500ms to resolve. To see if any error got emitted beforehand.
    setTimeout(() => {
      if (!rejected) r.resolve(consumer);
    }, 500);
  });

// pushProducerToStorage :: Consumer -> Task Error Consumer :: Push consumer to ./storage
const pushConsumerToStorage = consumer =>
  Task.task(r =>
    R.tryCatch(
      () => r.resolve(consumer),
      e => r.reject(e),
    )(storage.consumers.push(consumer)));

// initConsumer :: [{ topic :: String }] -> Task Result Error { KafkaConsumer :: String }
const initConsumer = topics =>
  createConsumerInstance(topics)
    .chain(pushConsumerToStorage)
    .map(() => Result.Ok({ KafkaConsumer: 'Ok' }))
    .orElse(err => Task.of(Result.Error({ KafkaConsumer: err })));

// getConsumerObservable :: Number -> Observable Error Consumer
const getConsumerObservable = consumerIndex =>
  Rx.Observable.create((obs) => {
    const consumer = storage.consumers[consumerIndex];
    if (consumer) {
      obs.next(consumer);
      obs.complete();
    } else obs.error(new Error('Consumer not found'));
  });

// onMessage :: Consumer -> Observable Message
const onMessage = consumer =>
  Rx.Observable.fromEvent(consumer, 'message');

// startConsuming :: Number -> Observable Error Message
const startConsuming = (consumerIndex = 0) =>
  getConsumerObservable(consumerIndex).flatMap(onMessage); // TODO: catch error

module.exports = {
  initConsumer,
  startConsuming,
};
