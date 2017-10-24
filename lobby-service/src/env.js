require('dotenv').config();

const DEFAULT_ENV = {
  APP_PORT: '3000',
  NODE_ENV: 'local',
};

function improveEnv(env) {
  return {
    ...DEFAULT_ENV,
    MONGO_URL: `mongodb://${env.MONGO_HOST}:${env.MONGO_PORT}/${env.MONGO_DB}`,
    ...env,
  };
}

exports.improvedEnv = improveEnv(process.env);
