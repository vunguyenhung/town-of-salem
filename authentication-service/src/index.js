const http = require('http');
const { improvedEnv } = require('./env');
const { app } = require('./app');
const database = require('./database');

const server = http.createServer(app);

server.listen(improvedEnv.APP_PORT, () => {
  console.log(
    ('App is running at http://localhost:%d in %s mode'),
    improvedEnv.APP_PORT, improvedEnv.NODE_ENV,
  );
});

database.connect(improvedEnv.MONGO_URL).then(() => {
  console.log('Database Connected!');
});
