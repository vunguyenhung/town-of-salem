/*
3rd Party library imports
 */
const { request } = require('graphql-request');
const config = require('config');
const log = require('debug')('src:integration.test');

/*
Project file imports
 */
const DB = require('./util/database');

// INFO: API Gateway service just merely test overall functionality of other services,
// INFO: since those services have their own sophisticated integration tests.

describe('Query Test', () => {
  beforeAll(async () => {
    await DB.connect(config.get('DB.URL'));
  });

  beforeEach(async () => {
    await DB.drop();
  });

  afterAll(async () => {
    await DB.disconnect();
  });

  it('should return a token when register valid user', async () => {
    // GIVEN

    // language=GraphQL
    const registerMutation = `
        mutation register($user: UserInput!){
            register(user: $user)
        }
    `;

    const registerMutationVariables = {
      user: {
        username: 'vunguyenhung',
        password: 'vunguyenhung',
      },
    };

    // WHEN
    // graphQLResponse :: { register :: String }
    const graphQLResponse = await request(
      config.get('GraphQL.Endpoint'),
      registerMutation,
      registerMutationVariables,
    );

    // THEN
    expect(graphQLResponse).not.toBeNull();
    expect(graphQLResponse.register).not.toBeNull();
    expect(typeof graphQLResponse.register).toBe('string');
  });

  it('should return a token when login with registered username & password', async () => {
    // GIVEN

    // language=GraphQL
    const registerMutation = `
        mutation register($user: UserInput!){
            register(user: $user)
        }
    `;

    // language=GraphQL
    const loginQuery = `
        query login($user: UserInput!){
            login(user: $user)
        }
    `;

    const userVariables = {
      user: {
        username: 'vunguyenhung',
        password: 'vunguyenhung',
      },
    };

    // send register mutation
    await request(
      config.get('GraphQL.Endpoint'),
      registerMutation,
      userVariables,
    );

    // WHEN
    // send login query
    const graphQLResponse = await request(
      config.get('GraphQL.Endpoint'),
      loginQuery,
      userVariables,
    );

    // THEN
    expect(graphQLResponse).not.toBeNull();
    expect(graphQLResponse.login).not.toBeNull();
    expect(typeof graphQLResponse.login).toBe('string');
  });
});
