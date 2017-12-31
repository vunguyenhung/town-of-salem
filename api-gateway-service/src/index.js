/*
3rd Party library imports
 */
const http = require('http');
const log = require('debug')('src:index');

/*
Graphql-related imports
 */
const { execute, subscribe } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');

/*
Project file imports
 */
const app = require('./app');
const config = require('config');
const { schema } = require('./infrastructures/graphql/schema');
const StartupTasks = require('./infrastructures/startup-tasks');
const { handleMessage } = require('./controllers/handle-message');

const server = http.createServer(app);

server.listen(config.get('App.port'), () => {
	SubscriptionServer.create(
		{ execute, subscribe, schema },
		{ server, path: '/graphql' },
	);
	log(
		('App is running at http://localhost:%d in %s mode'),
		config.get('App.port'), config.get('NODE_ENV'),
	);
});

StartupTasks.start()
	.run().promise()
	.then((onMessage) => {
		onMessage
			.subscribe((messageReceived) => {
				log('Message Received', messageReceived);
				handleMessage(messageReceived).run().promise()
					.then(result => log('publish result:', result));
			});
	})
	.catch(log);
