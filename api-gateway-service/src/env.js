const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const DEFAULT_ENV = {
  APP_PORT: '3000',
  NODE_ENV: 'local',
  GRAPHQL_SUBSCRIPTION_ENDPOINT: 'ws://localhost:3000/graphql',
};

function improveEnv(env) {
  return { ...DEFAULT_ENV, ...env };
}

exports.improvedEnv = improveEnv(process.env);
