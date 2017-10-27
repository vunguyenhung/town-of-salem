/*
Lobby Entity imports
 */
const {
  addUserToLobby,
  createLobby,
  isValidLobby,

  addUser,
  removeUser,
  addLobby,
  LobbyErrors,
} = require('../lobby.entity');

/*
3rd Party library imports
 */
const uuid = require('uuid/v4');
const Result = require('folktale/result');
const R = require('ramda');

describe('Lobby Entity', () => {
  const initialLobby = {
    id: uuid(),
    users: [],
    isClosed: false,
  };

  const closedLobby = {
    id: uuid(),
    users: [],
    isClosed: true,
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

  it('should return new Lobby with new UUID, empty Users and not Closed when create lobby', () => {
    // GIVEN

    // WHEN
    const actualResult = createLobby();
    const validationResult = isValidLobby(actualResult);

    // THEN
    expect(Result.Ok.hasInstance(validationResult)).toBeTruthy();
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
      const allClosedLobbies = [closedLobby];

      const expectedError = LobbyErrors.NoLobbyAvailable(allClosedLobbies);

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

  it('should return a new lobby list has new lobby when add a lobby to lobby list', () => {
    // GIVEN
    const secondLobby = {
      id: uuid(),
      users: [],
      isClosed: false,
    };

    const initialLobbies = [initialLobby, secondLobby];

    // WHEN
    const actualResult = addLobby(initialLobbies);

    // THEN
    expect(actualResult).toHaveLength(3);
    expect(actualResult[0]).toEqual(initialLobby);
    expect(actualResult[1]).toEqual(secondLobby);
    expect(Result.Ok.hasInstance(isValidLobby(actualResult[2]))).toBeTruthy();
  });

  it('should return lobby has specified user removed when remove the specified user', () => {
    // GIVEN
    const secondLobby = {
      id: uuid(),
      users: ['someUser1', 'someUser2', 'toBeRemovedUser'],
      isClosed: false,
    };

    const expectedSecondLobby = {
      ...secondLobby,
      users: ['someUser1', 'someUser2'],
    };

    const initialLobbies = [initialLobby, secondLobby];

    // WHEN
    const actualResult = removeUser('toBeRemovedUser', initialLobbies).merge();

    // THEN
    expect(actualResult).toHaveLength(2);
    expect(actualResult[0]).toEqual(initialLobby);
    expect(actualResult[1]).toEqual(expectedSecondLobby);
  });

  it(
    'should return Result.Error of LobbyError.LobbiesNotContainUsername when remove a not existing user from lobbies',
    () => {
      // GIVEN
      const secondLobby = {
        id: uuid(),
        users: ['someUser1', 'someUser2', 'someUser3'],
        isClosed: false,
      };
      const lobbies = [initialLobby, secondLobby];
      const notExistingUsername = 'notExistingUsername';

      const expectedError = LobbyErrors.LobbiesNotContainUsername(lobbies, notExistingUsername);

      // WHEN
      const actualResult = removeUser(notExistingUsername, lobbies);

      // THEN
      expect(Result.Error.hasInstance(actualResult)).toBeTruthy();
      expect(actualResult.merge()).toEqual(expectedError);
    },
  );

  it('should open the lobby when lobby is not full after a user got removed from it', () => {
    // GIVEN
    const randomUsername = () => (`someRandomUsername${Math.random()}`);
    const randomUsers = R.repeat(randomUsername, 14).map(fn => fn());
    const toBeRemovedUser = 'toBeRemovedUser';

    const toBeRemovedLobby = {
      id: uuid(),
      users: [...randomUsers, toBeRemovedUser],
      isClosed: true,
    };

    const lobbies = [toBeRemovedLobby];

    const expectedLobbies = [{
      ...toBeRemovedLobby,
      users: [...randomUsers],
      isClosed: false,
    }];

    // WHEN
    const actualResult = removeUser(toBeRemovedUser, lobbies);

    // THEN
    expect(Result.Ok.hasInstance(actualResult)).toBeTruthy();
    expect(actualResult.merge()).toEqual(expectedLobbies);
  });
});
