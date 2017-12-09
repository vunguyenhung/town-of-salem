/*
3rd Party library imports
 */
const config = require('config');
const { Producer, Consumer } = require('kafka-node-driver');
const Task = require('folktale/concurrency/task');

/*
Project file imports
 */
const { createTrace } = require('./utils');

const trace = createTrace('src:StartUpService');

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
		.chain(() => Producer.createTopics(['tos-phase-events'], 0))
		.map(trace('Create topic result: '))
		.chain(() => createConsumer(config.get('Kafka'), [{ topic: 'tos-phase-events' }]))
		.map(trace('Create consumer result: '))
		.chain(() => onMessage(0));

exports.start = constructTasks;
