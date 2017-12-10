/*
Project file imports
 */
const StartupTasks = require('./startup-tasks');
const { handleMessage } = require('./handle-message');
const { createTrace } = require('./utils');

const trace = createTrace('src:index');

StartupTasks.start().run().promise()
	.then((onMessage) => {
		onMessage
			.do(trace('Message received: '))
			.subscribe(msg =>
				handleMessage(msg).run().promise()
					.then(trace('After handling message: ')));
	})
	.catch(trace('Error while handling message: '));
