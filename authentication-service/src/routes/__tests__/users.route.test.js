const supertest = require('supertest');
const { app } = require('../../app');

const UserModel = require('../../database/model/user.model');
const sinon = require('sinon');
const MESSAGE = require('../../services/message');

describe('Some feature', () => {
  const URL = '/users';

  const userFindStub = sinon.stub(UserModel, 'find');
  const userCreateStub = sinon.stub(UserModel, 'create');

  it('should return 200 when get /users', () =>
    supertest(app).get(URL).expect(200));

  it('should return 400 when post /users with empty data', () =>
    supertest(app).post(URL).send({}).expect(400));

  it('should return return empty error when post /users with empty data', async () => {
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
    'should call return error when post /users with existing {username, password}',
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
    'should return 201 when post /users with valid {username, password} and save successfully',
    async () => {
      // mongoose find result:
      // [ { _id: 59e73e6ac10702cc6f2a6f03,
      //   username: 'someUsername',
      //   password: 'somePassword' } ]

      // STUB
      userFindStub.resolves([]);
      userCreateStub.resolves(true);

      const response = await supertest(app)
        .post(URL)
        .send({ username: 'someUsername', password: 'somePassword' });

      expect(response.status).toBe(201);
    },
  );
});
