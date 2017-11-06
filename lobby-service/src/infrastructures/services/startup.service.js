/*
3rd Party library imports
 */
const config = require('config');
const { Producer, Consumer } = require('kafka-node-driver');
// const log = require('debug')('src:StartUpService');
/*
Project file imports
 */
const { trace } = require('../../utils');

const createProducer = options =>
  Producer.createProducer(options)
    .map(producerStatus => ({ producerStatus }));

const createConsumer = (options, topics) =>
  Consumer.createConsumer(options, topics)
    .map(consumerStatus => ({ consumerStatus }));

const constructTasks = () =>
  createProducer(config.get('Kafka'))
    .map(trace('Create producer result: '))
    .chain(() => Producer.createTopics(['tos-lobby-events'], 0))
    .map(trace('Create topic result: '))
    .chain(() => createConsumer(config.get('Kafka'), [{ topic: 'tos-lobby-events' }]))
    .map(trace('Create consumer result: '));

const run = () => constructTasks()
// .orElse // TODO: catch error here.
  .run()
  .promise();

exports.run = run;
