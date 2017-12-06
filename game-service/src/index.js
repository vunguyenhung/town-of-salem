/*
3rd Party library imports
 */
const http = require('http');
const log = require('debug')('src:index');
const config = require('config');

/*
Project file imports
 */
const app = require('./app');
const StartupTasks = require('./infrastructures/startup-tasks');
const { handleMessage } = require('./infrastructures/handle-message');
const { createTrace } = require('./utils');

const trace = createTrace('src:index');

const server = http.createServer(app);

server.listen(config.get('App.port'), () => {
	log(
		('App is running at http://localhost:%d in %s mode'),
		config.get('App.port'), config.get('NODE_ENV'),
	);
});

StartupTasks.start().run().promise()
	.then((onMessage) => {
		onMessage
			.do(trace('Message received: '))
			.subscribe(msg =>
				handleMessage(msg).run().promise()
					.then(trace('After handling message: ')));
	})
	.catch(trace);
