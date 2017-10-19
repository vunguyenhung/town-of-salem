const database = require('./util/database');
const { improvedEnv } = require('./util/env');

describe('Some feature', () => {
  beforeAll(async () => {
    await database.connect(improvedEnv.MONGO_URL);
  });

  beforeEach(async () => {
    const dropDBResult = await database.drop();
    expect(dropDBResult).toBeTruthy();
  });

  afterAll(async () => {
    await database.disconnect();
  });

  it('should handle normal case', () => {
  });

  it('should handle the abnormal case', () => {
  });

  it('should handle the error case', () => {
  });

  it('should handle the edge case', () => {
  });

  it('should handle some special parameter', () => {
  });
});
