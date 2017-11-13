/*
3rd Party library imports
 */
const Task = require('folktale/concurrency/task');
const config = require('config');
const { Consumer, Producer } = require('kafka-node-driver');

/*
Project file imports
 */
const { trace } = require('../utils');

const createProducer = options =>
  Producer.createProducer(options)
    .map(producerStatus => ({ producerStatus }));

const createConsumer = (options, topics) =>
  Consumer.createConsumer(options, topics)
    .map(consumerStatus => ({ consumerStatus }));

const onMessage = consumerIndex =>
  Task.of(Consumer.onMessage(consumerIndex));

const constructTasks = () =>
  createProducer(config.get('Kafka'))
    .map(trace('Create producer result: '))
    .chain(() => Producer.createTopics(['tos-state-update-events'], 0))
    .map(trace('Create topic result: '))
    .chain(() => createConsumer(config.get('Kafka'), [{ topic: 'tos-state-update-events' }]))
    .map(trace('Create consumer result: '))
    .chain(() => onMessage(0));

exports.start = constructTasks;
