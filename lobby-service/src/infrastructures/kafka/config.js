// TODO: integrate this with env.js
const CONFIG = {
  CLIENT: { kafkaHost: 'kafka:9092' },
  CONSUMER: {
    // autoCommit: false,
    autoCommitIntervalMs: '2000',
    groupId: 'lobby-service',
  },
};

exports.CONFIG = CONFIG;
