require('dotenv').config();

const DEFAULT_ENV = {
  APP_PORT: '3000',
  NODE_ENV: 'local',
  GRAPHQL_SUBSCRIPTION_ENDPOINT: 'ws://localhost:3000/graphql',
  AUTHENTICATION_SERVICE_ENDPOINT: 'http://localhost:3001/auth',
};

function improveEnv(env) {
  return { ...DEFAULT_ENV, ...env };
}

exports.improvedEnv = improveEnv(process.env);
