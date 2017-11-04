/*
3rd Party library imports
 */
const configureMockStore = require('redux-mock-store').default;
const thunk = require('redux-thunk').default;
const uuid = require('uuid/v4');
const R = require('ramda');
// const { createLogger } = require('redux-logger');

/*
Project file imports
 */
const { StartUserAdd, StartLobbyAdd, StartUserRemove } = require('../effects');
const { ActionTypes } = require('../actions');
const { addUser, addLobby, removeUser } = require('../../../entities/index');
const { createLobby } = require('../../../entities/add-lobby');

const mockStore = configureMockStore([
  thunk,
  // createLogger(),
]);

describe('Lobby effect test', () => {
  it('should dispatch SetLobbies Action with new user added to an available lobby ' +
    'when dispatch StartUserAdd and there is an available lobby in lobbies', () => {
    // GIVEN
    const toBeAddedUser = 'vunguyenhung';

    const initialLobbies = [createLobby()];

    const expectedPayload = addUser(toBeAddedUser, initialLobbies).merge();

    const expectedActions = [
      { type: ActionTypes.SET_LOBBIES, payload: expectedPayload },
    ];

    // STUB
    const store = mockStore({ lobbies: initialLobbies });

    // WHEN
    store.dispatch(StartUserAdd(toBeAddedUser));
    const actualActions = store.getActions();

    // THEN
    expect(actualActions).toEqual(expectedActions);
  });

  it('should dispatch SetLobbies Action with new lobby added lobbies ' +
    'when dispatch StartLobbyAdd', () => {
    // GIVEN
    const initialLobbies = [createLobby()];

    // no need to call merge() here since addLobby return Array Lobby directly
    const expectedPayload = addLobby(initialLobbies);

    const expectedActions = [
      { type: ActionTypes.SET_LOBBIES, payload: expectedPayload },
    ];

    // STUB
    const store = mockStore({ lobbies: initialLobbies });

    // WHEN
    // this also return action object
    console.log('start Lobby Add dispatch: ', store.dispatch(StartLobbyAdd()));
    const actualActions = store.getActions();

    // THEN
    expect(actualActions).toEqual(expectedActions);
  });

  it('should dispatch SetLobbies with new lobby contains new user added ' +
    'when dispatch StartUserAdd thunk and there is no available lobby', () => {
    // GIVEN
    const fullLobby = {
      id: uuid(),
      users: R.repeat('vunguyenhung', 15),
      isClosed: true,
    };

    const fullLobbiesState = {
      lobbies: [fullLobby],
    };

    const toBeAddedUsername = 'toBeAddedUsername';

    const expectedPayload = [
      fullLobby,
      {
        id: uuid(),
        users: [toBeAddedUsername],
        isClosed: false,
      },
    ];

    const expectedActions = [
      { type: ActionTypes.SET_LOBBIES, payload: expectedPayload },
    ];

    // STUB
    const store = mockStore(fullLobbiesState);

    // WHEN
    store.dispatch(StartUserAdd(toBeAddedUsername));
    const actualActions = store.getActions();

    // THEN
    expect(actualActions[0].type).toEqual(expectedActions[0].type);
    expect(actualActions[0].payload[0]).toEqual(expectedActions[0].payload[0]);
    expect(actualActions[0].payload[1].users).toEqual(expectedActions[0].payload[1].users);
    expect(actualActions[0].payload[1].isClosed).toEqual(expectedActions[0].payload[1].isClosed);
  });

  it('should dispatch SetLobbiesFailed Action ' +
    'when dispatch StartUserAdd and lobbies already containing user', () => {
    // GIVEN
    const existingUser = 'user2';

    const initialLobbies = [{
      id: uuid(),
      users: ['user1', existingUser, 'user3'],
      isClosed: true,
    }];

    const expectedPayload = addUser(existingUser, initialLobbies).merge();

    const expectedActions = [
      { type: ActionTypes.SET_LOBBIES_FAILED, payload: expectedPayload },
    ];

    // STUB
    const store = mockStore({ lobbies: initialLobbies });

    // WHEN
    store.dispatch(StartUserAdd(existingUser));
    const actualActions = store.getActions();

    // THEN
    expect(actualActions).toEqual(expectedActions);
  });

  it('should dispatch SetLobbies Action with specified user removed from an containing lobby ' +
    'when dispatch StartUserRemove', () => {
    // GIVEN
    const toBeRemovedUser = 'user2';

    const initialLobbies = [{
      id: uuid(),
      users: ['user1', toBeRemovedUser, 'user3'],
      isClosed: true,
    }];

    const expectedPayload = removeUser(toBeRemovedUser, initialLobbies).merge();

    const expectedActions = [
      { type: ActionTypes.SET_LOBBIES, payload: expectedPayload },
    ];

    // STUB
    const store = mockStore({ lobbies: initialLobbies });

    // WHEN
    store.dispatch(StartUserRemove(toBeRemovedUser));
    const actualActions = store.getActions();

    // THEN
    expect(actualActions).toEqual(expectedActions);
  });

  it('should dispatch SetLobbiesFailed Action ' +
    'when dispatch StartUserRemove with lobbies not containing user', () => {
    // GIVEN
    const notExistingUser = 'user2';

    const initialLobbies = [{
      id: uuid(),
      users: ['user1', 'user3'],
      isClosed: true,
    }];

    const expectedPayload = removeUser(notExistingUser, initialLobbies).merge();

    const expectedActions = [
      { type: ActionTypes.SET_LOBBIES_FAILED, payload: expectedPayload },
    ];

    // STUB
    const store = mockStore({ lobbies: initialLobbies });

    // WHEN
    store.dispatch(StartUserRemove(notExistingUser));
    const actualActions = store.getActions();

    // THEN
    expect(actualActions).toEqual(expectedActions);
  });
});
