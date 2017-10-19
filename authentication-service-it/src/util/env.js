const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const DEFAULT_ENV = {
  NODE_ENV: 'local',
};

const improveEnv = env => ({
  ...DEFAULT_ENV,
  MONGO_URL: `mongodb://${env.MONGO_HOST}:${env.MONGO_PORT}/${env.MONGO_DB}`,
  ...env,
});

exports.improvedEnv = improveEnv(process.env);
