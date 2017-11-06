/*
3rd Party library imports
 */
const config = require('config');
const { Producer, Consumer } = require('kafka-node-driver');
const Task = require('folktale/concurrency/task');
// const log = require('debug')('src:StartUpService');
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
    .chain(() => Producer.createTopics(['tos-lobby-events'], 0))
    .map(trace('Create topic result: '))
    .chain(() => createConsumer(config.get('Kafka'), [{ topic: 'tos-lobby-events' }]))
    .map(trace('Create consumer result: '))
    .chain(() => onMessage(0));

// const start = () => constructTasks();
// .orElse(error => );

exports.start = constructTasks;
