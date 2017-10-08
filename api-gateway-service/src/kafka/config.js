const CONFIG = {
  CLIENT: { kafkaHost: 'kafka:9092' },
  CONSUMER: {
    autoCommit: false,
    groupId: 'api-gateway-service',
  },
  CONSUMER_TOPICS: [{ topic: 'tos-user-events' }],
};

exports.CONFIG = CONFIG;
