const supertest = require('supertest');
const { app } = require('../app');

describe('App general test', () => {
  it('should return 200-OK code when request /', () =>
    supertest(app).get('/').expect(200));
});
