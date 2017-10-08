const { KafkaClient, Consumer } = require('kafka-node');

// TODO: finish this when integrate Graphql Subscription

const CLIENT_OPTIONS = { kafkaHost: 'kafka:9092' };

const CONSUMER_OPTIONS = {
  autoCommit: false,
  groupId: 'api-gateway-service',
};

const CONSUMER_TOPICS = [
  { topic: 'tos-user-events' },
];

const CONSUMER_EVENT_HANDLERS = {
  onMessage: (message, consumer) => {
    console.log('onMessage');
    console.log(message);
    consumer.commit((error, data) => {
      if (error) console.log(error);
      else console.log(data);
    });
  },
  onError: (error) => {
    console.log('onError');
    console.log(error);
  },
};

// after committing, send stateChanges back to client via Graphql Subscription.
// If committing failed?
const startConsuming = () => {
  const client = new KafkaClient(CLIENT_OPTIONS);
  const consumer = new Consumer(client, CONSUMER_TOPICS, CONSUMER_OPTIONS);
  consumer.on(
    'message',
    (message) => {
      CONSUMER_EVENT_HANDLERS.onMessage(message, consumer);
    },
  );
  consumer.on('error', CONSUMER_EVENT_HANDLERS.onError);
};

exports.startConsuming = startConsuming;
