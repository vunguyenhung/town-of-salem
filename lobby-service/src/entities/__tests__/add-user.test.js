/*
3rd Party library imports
 */
const Result = require('folktale/result');
const uuid = require('uuid/v4');
const R = require('ramda');

/*
Project file imports
 */
const { addUserToLobby, addUser } = require('../add-user');
const { LobbyErrors } = require('../common');

describe('Lobby Entity add user operation', () => {
  const initialLobby = {
    id: uuid(),
    users: [],
    isClosed: false,
  };

  const validUsername = 'vunguyenhung';

  it('should return Result Ok with new lobby has newly added users when valid user join', () => {
    // GIVEN
    const expectedLobby = {
      ...initialLobby,
      users: [validUsername],
    };

    // WHEN
    const actualResult = addUserToLobby(validUsername, initialLobby);

    // THEN
    expect(Result.Ok.hasInstance(actualResult)).toBeTruthy();
    expect(actualResult.merge()).toEqual(expectedLobby);
  });

  it('should return LobbyErrors.LobbyFull when adding user to a full Lobby', () => {
    // GIVEN
    const toBeAddedLobby = {
      id: uuid(),
      users: R.repeat(validUsername, 15),
      isClosed: false,
    };

    const expectedError = LobbyErrors.LobbyFull(toBeAddedLobby);

    // WHEN
    const actualResult = addUserToLobby(validUsername, toBeAddedLobby);

    // THEN
    expect(Result.Error.hasInstance(actualResult)).toBeTruthy();
    expect(actualResult.merge()).toEqual(expectedError);
  });

  it('should return LobbyErrors.EmptyUsername when add empty username', () => {
    // GIVEN
    const emptyUsername = '';

    const expectedError = LobbyErrors.EmptyUsername(emptyUsername);

    // WHEN
    const actualResult = addUserToLobby(emptyUsername, initialLobby);

    // THEN
    expect(Result.Error.hasInstance(actualResult)).toBeTruthy();
    expect(actualResult.merge()).toEqual(expectedError);
  });

  it('should return LobbyErrors.MissingFields when add to a lobby missing any fields', () => {
    // GIVEN
    const missingFieldsLobby = {
      // missing id
      users: [],
      isClosed: false,
    };

    const expectedError = LobbyErrors.MissingFields(missingFieldsLobby);

    // WHEN
    const actualResult = addUserToLobby(validUsername, missingFieldsLobby);

    // THEN
    expect(Result.Error.hasInstance(actualResult)).toBeTruthy();
    expect(actualResult.merge()).toEqual(expectedError);
  });

  it(
    'should return Result.Ok of Array Lobby when a user joins an available lobby in lobby list',
    () => {
      // GIVEN
      const initialLobbies = [initialLobby];

      const expectedLobbies = [{
        ...initialLobby,
        users: [validUsername],
      }];

      // WHEN
      const actualResult = addUser(validUsername, initialLobbies);

      // THEN
      expect(Result.Ok.hasInstance(actualResult)).toBeTruthy();
      expect(actualResult.merge()).toEqual(expectedLobbies);
    },
  );

  it(
    'should return Result.Error of LobbyError.NoLobbyAvailable when a user joins lobby list with full of closed lobby',
    () => {
      // GIVEN
      const closedLobby = {
        id: uuid(),
        users: [],
        isClosed: true,
      };
      const allClosedLobbies = [closedLobby];

      const expectedError = LobbyErrors.NoLobbyAvailable(allClosedLobbies, validUsername);

      // WHEN
      const actualResult = addUser(validUsername, allClosedLobbies);

      // THEN
      expect(Result.Error.hasInstance(actualResult)).toBeTruthy();
      expect(actualResult.merge()).toEqual(expectedError);
    },
  );

  it(
    'should add user to the first unclosed lobby when a user joins lobby list',
    () => {
      // GIVEN
      const secondLobby = {
        id: uuid(),
        users: [],
        isClosed: false,
      };

      const initialLobbies = [initialLobby, secondLobby];

      const expectedLobbies = [{
        ...initialLobby,
        users: [validUsername],
      }, secondLobby];

      // WHEN
      const actualResult = addUser(validUsername, initialLobbies);

      // THEN
      expect(Result.Ok.hasInstance(actualResult)).toBeTruthy();
      expect(actualResult.merge()).toEqual(expectedLobbies);
    },
  );

  it('should close the full lobby when a user joins an almost full lobby', () => {
    // GIVEN
    const randomUsername = () => (`someRandomUsername${Math.random()}`);

    const toBeClosedLobby = {
      id: uuid(),
      users: R.repeat(randomUsername, 14).map(fn => fn()),
      isClosed: false,
    };

    const lobbies = [toBeClosedLobby];

    const expectedLobbies = [{
      ...toBeClosedLobby,
      users: [...toBeClosedLobby.users, validUsername],
      isClosed: true,
    }];

    // WHEN
    const actualResult = addUser(validUsername, lobbies);

    // THEN
    expect(Result.Ok.hasInstance(actualResult)).toBeTruthy();
    expect(actualResult.merge()).toEqual(expectedLobbies);
  });

  it(
    'should return Result.Error of LobbyError.LobbiesAlreadyContainsUser when a user joins lobby list which already have lobby contains it',
    () => {
      // GIVEN
      const existingUsername = 'existingUsername';
      const secondLobby = {
        id: uuid(),
        users: ['someUsername1', existingUsername, 'someUsername2'],
        isClosed: false,
      };
      const lobbies = [initialLobby, secondLobby];

      const expectedError = LobbyErrors.LobbiesAlreadyContainsUser(lobbies, existingUsername);

      // WHEN
      const actualResult = addUser(existingUsername, lobbies);

      // THEN
      expect(Result.Error.hasInstance(actualResult)).toBeTruthy();
      expect(actualResult.merge()).toEqual(expectedError);
    },
  );
});
