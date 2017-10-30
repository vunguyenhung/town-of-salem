/*
3rd Party library imports
 */
const configureMockStore = require('redux-mock-store').default;
const thunk = require('redux-thunk').default;
const uuid = require('uuid/v4');
// const { createLogger } = require('redux-logger');

/*
Project file imports
 */
const { StartUserAdd } = require('../');
const { ActionTypes } = require('../../actions');
const { addUser } = require('../../../entities');

const mockStore = configureMockStore([
  thunk,
  // createLogger(),
]);

describe('Lobby effect test', () => {
  // TODO: remove duplication of this
  const initialLobby = {
    id: uuid(),
    users: [],
    isClosed: false,
  };

  const initialLobbies = [initialLobby];

  const initialState = {
    lobbies: initialLobbies,
  };

  it('should dispatch SetLobbies Action after successfully add user to lobbies', () => {
    // STUB
    const store = mockStore(initialState);

    // GIVEN
    const toBeAddedUser = 'vunguyenhung';

    const expectedPayload = addUser(toBeAddedUser, initialLobbies).merge();

    const expectedActions = [
      { type: ActionTypes.SET_LOBBIES, payload: expectedPayload },
    ];

    // WHEN
    store.dispatch(StartUserAdd('vunguyenhung'));
    const actualActions = store.getActions();

    // THEN
    expect(actualActions).toEqual(expectedActions);
  });

  it('should handle the abnormal case', () => {
  });

  it('should handle the error case', () => {
  });

  it('should handle the edge case', () => {
  });

  it('should handle some special parameter', () => {
  });
});
