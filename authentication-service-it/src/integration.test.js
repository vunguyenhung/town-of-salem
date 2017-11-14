/* eslint-disable no-underscore-dangle */
const R = require('ramda');

const database = require('./util/database');
const { improvedEnv } = require('./util/env');
const MESSAGE = require('./util/message');
const superagent = require('superagent');

const { build } = require('./util/util');
const { promisify } = require('util');

const jwt = require('jsonwebtoken');

const _verifyJWT = promisify(jwt.verify);

const verifyJWT = R.partialRight(_verifyJWT, [improvedEnv.JWT_SECRET]);

describe('Authentication service', () => {
  let existingUsers;

  const post = data => superagent.post(improvedEnv.ENDPOINT).send(data).ok(res => res.status < 500);
  const get = ({ username, password }) => superagent.get(improvedEnv.ENDPOINT)
    .set('username', username)
    .set('password', password)
    .ok(res => res.status < 500);

  beforeAll(async () => {
    await database.connect(improvedEnv.MONGO_URL);
  });

  beforeEach(async () => {
    const dropDBResult = await database.drop();
    expect(dropDBResult).toBeTruthy();

    existingUsers = await database.model.create(build(10));
    expect(existingUsers).toHaveLength(10);
  });

  afterAll(async () => {
    await database.disconnect();
  });

  it('should return 400 and correct errors when post with empty data', async () => {
    // GIVEN
    const expectedBody = {
      errors:
        {
          username:
            {
              location: 'body',
              param: 'username',
              msg: MESSAGE.USERNAME_TOO_SHORT,
            },
          password:
            {
              location: 'body',
              param: 'password',
              msg: MESSAGE.PASSWORD_TOO_SHORT,
            },
        },
    };

    // WHEN
    const response = await post({});

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(expectedBody);
  });

  it(
    'should return 400 and correct errors when post with existing {username, password}',
    async () => {
      // GIVEN
      const { username, password } = existingUsers[0];
      const expectedBody = {
        errors:
          {
            username:
              {
                location: 'body',
                param: 'username',
                value: username,
                msg: MESSAGE.USERNAME_IN_USE,
              },
          },
      };

      // WHEN
      const response = await post({ username, password });

      // THEN
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual(expectedBody);
    },
  );

  it(
    'should return 201 when post with valid {username, password} and save successfully',
    async () => {
      // GIVEN
      const newUser = {
        username: 'newUsername',
        password: 'newPassword',
      };

      // WHEN
      const res = await post(newUser);
      const dbData = await database.model.find({});
      const extractedUsers = R.map(R.pick(['username', 'password']))(dbData);

      // THEN
      expect(res.statusCode).toBe(201);
      expect(dbData).toHaveLength(11);
      expect(R.contains(extractedUsers, newUser));
    },
  );

  it('should return 200 and Token when get with valid username/password in header', async () => {
    // GIVEN
    const { username, password } = existingUsers[0];

    const expectedDecodedToken = { username };

    // WHEN
    const response = await get({ username, password });
    const { token } = response.body;
    const decodedToken = await verifyJWT(token);

    // THEN
    expect(response.status).toBe(200);
    expect(decodedToken).toEqual(expectedDecodedToken);
  });

  it('should return 401 when get with invalid username/password in header', async () => {
    // GIVEN
    const notExistingUser = {
      username: 'notExistingUsername',
      password: 'notExistingPassword',
    };

    // WHEN
    const response = await get(notExistingUser);

    // THEN
    expect(response.statusCode).toBe(401);
  });
});
