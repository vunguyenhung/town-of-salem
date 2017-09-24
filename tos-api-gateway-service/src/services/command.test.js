const commandService = require('./command');

describe('Command Service', () => {
  it('should return StartRegisterEvent when convert RegisterCommand', () => {
    // GIVEN
    const registerCommand = {
      type: '[Command] Register',
      payload: {
        username: 'someUsername',
        password: 'somePassword',
      },
    };

    const expectedRegisterEvent = {
      type: '[Event] Start Register',
      payload: {
        username: 'someUsername',
        password: 'somePassword',
      },
    };

    // WHEN
    const actualRegisterEvent = commandService.commandToEvents(registerCommand);

    // THEN
    expect(actualRegisterEvent).toEqual(expectedRegisterEvent);
  });

  it('should return InvalidCommandReceivedEvent when convert command has invalid type', () => {
    // GIVEN
    const invalidCommand = {
      type: '[Command] Invalid command',
      payload: {
        username: 'someUsername',
        password: 'somePassword',
      },
    };

    const expectedRegisterEvent = {
      type: '[Event] Invalid Command Received',
      payload: {
        reason: 'Invalid type',
        command: invalidCommand,
      },
    };

    // WHEN
    const actualInvalidEvent = commandService.commandToEvents(invalidCommand);

    // THEN
    expect(actualInvalidEvent).toEqual(expectedRegisterEvent);
  });

  it('should return StartLoginEvent when convert LoginCommand', () => {
    // GIVEN
    const loginCommand = {
      type: '[Command] Login',
      payload: {
        username: 'someUsername',
        password: 'somePassword',
      },
    };

    const expectedLoginEvent = {
      type: '[Event] Start Login',
      payload: loginCommand.payload,
    };

    // WHEN
    const actualInvalidEvent = commandService.commandToEvents(loginCommand);

    // THEN
    expect(actualInvalidEvent).toEqual(expectedLoginEvent);
  });

  it(
    'should return InvalidCommandReceivedEvent when convert command has invalid payload shape',
    () => {
      // GIVEN
      const invalidCommand = {
        type: '[Command] Register',
        payload: {
          username: 'someUsername',
          // missing password
        },
      };

      const expectedRegisterEvent = {
        type: '[Event] Invalid Command Received',
        payload: {
          reason: 'Invalid payload',
          command: invalidCommand,
        },
      };

      // WHEN
      const actualInvalidEvent = commandService.commandToEvents(invalidCommand);

      // THEN
      expect(actualInvalidEvent).toEqual(expectedRegisterEvent);
    },
  );

  it('should return InvalidCommandReceivedEvent when convert invalid shape command', () => {
    // GIVEN
    const invalidCommand = {
      invalidField: 'invalidVal',
    };

    const expectedRegisterEvent = {
      type: '[Event] Invalid Command Received',
      payload: {
        reason: 'Invalid shape',
        command: invalidCommand,
      },
    };

    // WHEN
    const actualInvalidEvent = commandService.commandToEvents(invalidCommand);

    // THEN
    expect(actualInvalidEvent).toEqual(expectedRegisterEvent);
  });
});
