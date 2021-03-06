/* eslint-disable no-underscore-dangle */
const { promisify } = require('util');

const supertest = require('supertest');
const sinon = require('sinon');

const R = require('ramda');

const { app } = require('../../app');
const { improvedEnv } = require('../../env');
const UserModel = require('../../database/model/user.model');
const MESSAGE = require('../../services/message');

const jwt = require('jsonwebtoken');

const _verifyJWT = promisify(jwt.verify);

const verifyJWT = R.partialRight(_verifyJWT, [improvedEnv.JWT_SECRET]);

describe('Some feature', () => {
  const URL = '/auth';

  const userFindStub = sinon.stub(UserModel, 'find');
  const userFindOneStub = sinon.stub(UserModel, 'findOne');
  const userCreateStub = sinon.stub(UserModel, 'create');

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
    const response = await supertest(app).post(URL).send({});

    // THEN
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(expectedBody);
  });

  it(
    'should return 400 and correct errors when post with existing {username, password}',
    async () => {
      // GIVEN
      const existingUser = { username: 'existingUsername', password: 'existingUsername' };
      const dbResult = [existingUser];
      const expectedBody = {
        errors:
          {
            username:
              {
                location: 'body',
                param: 'username',
                value: 'existingUsername',
                msg: MESSAGE.USERNAME_IN_USE,
              },
          },
      };

      // STUB
      userFindStub.resolves(dbResult);

      // WHEN
      const response = await supertest(app)
        .post(URL)
        .send({ username: 'existingUsername', password: 'existingUsername' });

      // THEN
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual(expectedBody);
    },
  );

  it(
    'should return 201 when post with valid {username, password} and save successfully',
    async () => {
      // mongoose find result:
      // [ { _id: 59e73e6ac10702cc6f2a6f03,
      //   username: 'someUsername',
      //   password: 'somePassword' } ]

      // STUB
      userFindStub.resolves([]);
      userCreateStub.resolves(true);

      // WHEN
      const response = await supertest(app)
        .post(URL)
        .send({ username: 'someUsername', password: 'somePassword' });

      // THEN
      expect(response.status).toBe(201);
      // this route doesn't return body
    },
  );

  it(
    'should return 200 and Token when get with valid username/password in header',
    async () => {
      // mongoose find result:
      // [ { _id: 59e73e6ac10702cc6f2a6f03,
      //   username: 'someUsername',
      //   password: 'somePassword' } ]

      // GIVEN
      const validUser = {
        username: 'validUsername',
        password: 'validPassword',
      };

      const expectedDecodedToken = {
        username: validUser.username,
      };

      // STUB
      userFindOneStub.resolves(validUser);

      // WHEN
      const response = await supertest(app)
        .get(URL)
        .set('username', validUser.username)
        .set('password', validUser.password);
      const { token } = response.body;
      const decodedToken = await verifyJWT(token);

      // THEN
      expect(response.status).toBe(200);
      expect(decodedToken).toEqual(expectedDecodedToken);
    },
  );

  it(
    'should return 401 when get with invalid username/password in header',
    async () => {
      // GIVEN
      const validUser = {
        username: 'invalidUsername',
        password: 'invalidPassword',
      };

      // STUB
      userFindOneStub.resolves(null);

      // WHEN
      const response = await supertest(app)
        .get(URL)
        .set('username', validUser.username)
        .set('password', validUser.password);

      // THEN
      expect(response.status).toBe(401);
      // this route doesn't return body
    },
  );
});
