/*
3rd Party library imports
 */
const uuid = require('uuid/v4');

/*
Project file imports
 */
const { _updateLobbies } = require('../reducers');

describe('Lobby reducer', () => {
  it('should return new Lobbies correctly when update a lobby in lobbies', () => {
    // GIVEN
    const id = uuid();

    const initialLobby = {
      id,
      users: [],
      isClosed: false,
    };

    const initialLobbies = [initialLobby];

    const shouldBeUpdatedLobby = {
      id,
      users: ['newUser'],
      isClosed: false,
    };

    // WHEN
    const actualLobbies = _updateLobbies(initialLobbies, shouldBeUpdatedLobby);

    // THEN
    expect(actualLobbies).toEqual(actualLobbies);
  });
});
