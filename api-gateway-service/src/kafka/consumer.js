// const { KafkaClient, Consumer } = require('kafka-node');
// const { CONFIG } = require('./config');
// const { storage } = require('./storage');
//
// // TODO: finish this when integrate Graphql Subscription
//
// // create new client with CONFIG
// // create new consumer
// // add createdConsumer to storage
// // onMessage will be a subject
//
// // what should be return from this?
// const _createConsumer = () => {
//   const client = new KafkaClient(CONFIG.CLIENT);
//   const consumer = new Consumer(client, CONFIG.CONSUMER_TOPICS, CONFIG.CONSUMER);
//   storage.consumers.push(consumer);
// };
//
// // where should be subscribe to the subject?
// const CONSUMER_EVENT_HANDLERS = {
//   // onMessageObservable
//   onMessage: (message, consumer) => {
//     console.log('onMessage');
//     console.log(message);
//     // must commit in onMessage
//     consumer.commit((error, data) => {
//       if (error) console.log(error);
//       else console.log(data);
//     });
//   },
//   // onErrorObservable
//   onError: (error) => {
//     console.log('onError');
//     console.log(error);
//   },
// };
//
// // after committing, send stateChanges back to client via Graphql Subscription.
// // If committing failed?
// // subscribe to the subject here?
// // return observable, others where subscribe to it must commit themselves
// const startConsuming = () => {
//   consumer.on(
//     'message',
//     (message) => {
//       CONSUMER_EVENT_HANDLERS.onMessage(message, consumer);
//     },
//   );
//   // don't handle this right now
//   consumer.on('error', CONSUMER_EVENT_HANDLERS.onError);
// };
//
// exports.startConsuming = startConsuming;
