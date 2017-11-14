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

  it('should return correct token when register valid user', async () => {
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
    const graphQLResponse = await request(
      config.get('GraphQL.Endpoint'),
      registerMutation,
      registerMutationVariables,
    );

    // THEN
    log(graphQLResponse);
  });
});
