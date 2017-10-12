const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const DEFAULT_ENV = {
  APP_PORT: '3000',
  NODE_ENV: 'local',
};

exports.improvedEnv = { ...DEFAULT_ENV, ...process.env };
