/*
3rd Party library imports
 */
const http = require('http');
const log = require('debug')('src:index');
const config = require('config');

const server = http.createServer(app);

/*
Project file imports
 */
const StartupTasks = require('./startup-tasks');
const { handleMessage } = require('./handle-message');
const { createTrace } = require('./utils');

const trace = createTrace('src:index');

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
	.catch(trace('Error while handling message: '));
