/*
3rd Party library imports
 */
const uuid = require('uuid/v4');

/*
Project file imports
 */
const { reducer, lobbiesSelector } = require('../reducers');
const { SetLobbies } = require('../actions');

describe('Lobby reducer', () => {
  // TODO: remove duplication of this in effects/effects.test.js
  const initialLobby = {
    id: uuid(),
    users: [],
    isClosed: false,
  };

  const initialLobbies = [initialLobby];

  const initialState = {
    lobbies: initialLobbies,
  };

  it('should return lobbies correctly when get it from State by lobbiesSelector', () => {
    expect(lobbiesSelector(initialState)).toEqual(initialLobbies);
  });

  it('should set new lobbies in State when dispatch SetLobbies Action', () => {
    // GIVEN
    const emptyState = {
      lobbies: [],
    };

    // WHEN
    const actualState = reducer(emptyState, SetLobbies(initialLobbies));

    // THEN
    expect(actualState).toEqual(initialState);
  });
});
