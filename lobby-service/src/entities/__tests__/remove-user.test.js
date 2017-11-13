/*
3rd Party library imports
 */
const Result = require('folktale/result');
const uuid = require('uuid/v4');
const R = require('ramda');

/*
Project file imports
 */
const { removeUser } = require('../remove-user');
const { LobbyErrors } = require('../common');

describe('Lobby Entity remove user operation', () => {
  const firstLobby = {
    id: uuid(),
    users: [],
    isClosed: false,
  };

  const secondLobby = {
    id: uuid(),
    users: ['someUser1', 'someUser2', 'someUser3'],
    isClosed: false,
  };

  it('should return lobby has specified user removed when remove the specified user', () => {
    // GIVEN
    const lobbies = [firstLobby, secondLobby];

    const expectedSecondLobby = {
      ...secondLobby,
      users: ['someUser1', 'someUser2'],
    };

    // WHEN
    const actualResultLobby = removeUser('someUser3', lobbies).merge();

    // THEN
    expect(actualResultLobby).toEqual(expectedSecondLobby);
  });

  it(
    'should return Result.Error of LobbyError.LobbiesNotContainUsername when remove a not existing user from lobbies',
    () => {
      // GIVEN
      const lobbies = [firstLobby, secondLobby];

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

    const lobbies = [firstLobby, secondLobby, toBeRemovedLobby];

    const expectedLobby = {
      ...toBeRemovedLobby,
      users: [...randomUsers],
      isClosed: false,
    };

    // WHEN
    const actualResultLobby = removeUser(toBeRemovedUser, lobbies);

    // THEN
    expect(Result.Ok.hasInstance(actualResultLobby)).toBeTruthy();
    expect(actualResultLobby.merge()).toEqual(expectedLobby);
  });
});
