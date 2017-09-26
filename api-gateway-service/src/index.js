const dotenv = require('dotenv');
const server = require('./server');
const env = require('./env');

dotenv.config({ path: '.env' });

server.run(env.imroveEnv(process.env));
