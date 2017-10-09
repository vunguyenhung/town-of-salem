const CONFIG = {
  CLIENT: { kafkaHost: 'kafka:9092' },
  CONSUMER: {
    autoCommit: false,
    groupId: 'api-gateway-service',
  },
  CONSUMER_TOPICS: [{ topic: 'tos-state-changes' }],
};

exports.CONFIG = CONFIG;
