/*
3rd Party imports
 */
const Result = require('folktale/result');

/*
Project file imports
 */
const { commandToResult } = require('../command');
const { TOPICS } = require('../../kafka/producer');
const { InvalidCommandError } = require('../../graphql/errors');

describe('Command Service', () => {
  it('should return Ok Result when convert valid command', () => {
    // GIVEN
    const registerCommand = {
      type: 'DO_SOMETHING',
      payload: {
        requiredData: 'some valid data',
      },
    };

    const expectedKafkaMessage = {
      topic: TOPICS.SOME_TOPIC,
      messages: JSON.stringify(registerCommand),
    };

    // WHEN
    const actualResult = commandToResult(registerCommand);

    // THEN
    expect(Result.Ok.hasInstance(actualResult));
    expect(actualResult.merge()).toEqual(expectedKafkaMessage);
  });

  it(
    'should return InvalidCommandError(Invalid Type) when convert command has invalid type',
    () => {
      // GIVEN
      const invalidCommand = {
        type: 'INVALID_TYPE',
        // INVALID_TYPE != DO_SOMETHING
        payload: {
          requiredData: 'some valid data',
        },
      };

      const expectedError = new InvalidCommandError({ message: 'Invalid type' });

      // WHEN
      const actualResult = commandToResult(invalidCommand);

      // THEN
      expect(Result.Error.hasInstance(actualResult));
      expect(actualResult.merge()).toEqual(expectedError);
    },
  );

  it(
    'should return InvalidCommandError(Invalid Payload) when convert command has invalid payload',
    () => {
      // GIVEN
      const invalidCommand = {
        type: 'DO_SOMETHING',
        payload: {
          invalidData: 'someUsername',
          // invalidData != requiredData
        },
      };

      const expectedError = new InvalidCommandError({ message: 'Invalid payload' });

      // WHEN
      const actualResult = commandToResult(invalidCommand);

      // THEN
      expect(Result.Error.hasInstance(actualResult));
      expect(actualResult.merge()).toEqual(expectedError);
    },
  );
});
