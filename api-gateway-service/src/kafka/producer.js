// to use producer: require('...').instance;
const { CONFIG } = require('./config');
const { Producer, KafkaClient } = require('kafka-node');
const { storage } = require('./storage');

const { promisify } = require('util');

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

const createProducerManager = () => {
  const createProducer = () => {
    const createdProducer = _createProducer();
    storage.producers.push(createdProducer);
    return onProducerReady(createdProducer);
  };

  const publishMessage = (message, index = 0) =>
    _publishMessage(storage.producers[index], message);

  return {
    createProducer,
    publishMessage,
  };
};

exports.producerManager = createProducerManager();
