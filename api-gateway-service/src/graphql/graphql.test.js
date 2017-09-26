const schema = require('./schema');
const graphql = require('graphql');

describe('GraphQL', () => {
  // how to test the command has converted OK ?
  it('should return success response when send valid RegisterEvent', async () => {
    // GIVEN
    // language=GraphQL
    const query = `
        mutation sendCommand($command: CommandInput!){
            sendCommand(command: $command)
        }
    `;

    const variable = {
      command: {
        type: '[Command] Register',
        payload: JSON.stringify({ username: 'someUsername', password: 'somePassword' }),
      },
    };

    const expectedResult = {
      data: {
        sendCommand: 'Command sent successfully!',
      },
    };

    // WHEN
    const result = await graphql.graphql(schema.schema, query, null, null, variable);

    // THEN
    expect(result).toEqual(expectedResult);
  });

  it('should return InvalidPayload error response when send invalid RegisterEvent', async () => {
    // GIVEN
    // language=GraphQL
    const query = `
        mutation sendCommand($command: CommandInput!){
            sendCommand(command: $command)
        }
    `;

    const variable = {
      command: {
        type: '[Command] Register',
        payload: JSON.stringify({ username: 'someUsername' }),
      },
    };

    const expectedError = new graphql.GraphQLError('Invalid payload');

    const expectedResult = {
      data: null,
      errors: [
        expectedError,
      ],
    };

    // WHEN
    const result = await graphql.graphql(schema.schema, query, null, null, variable);

    // THEN
    expect(result).toEqual(expectedResult);
  });
});
