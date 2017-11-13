/*
3rd Party library imports
 */
const configureMockStore = require('redux-mock-store').default;
const thunk = require('redux-thunk').default;
const uuid = require('uuid/v4');
const R = require('ramda');
const sinon = require('sinon');
// const { createLogger } = require('redux-logger');

/*
Project file imports
 */
const { StartUserAdd, StartUserRemove } = require('../effects');
const { ActionTypes } = require('../actions');
const { addUser, removeUser } = require('../../../entities/index');
const { createLobby } = require('../../../entities/add-lobby');

const Utils = require('../utils');

const mockStore = configureMockStore([
  thunk,
  // createLogger(),
]);

describe('Lobby effect test', () => {
  const sendEventStub = sinon.stub(Utils, 'sendEvent');

  it('should dispatch ADD_USER Action with new user added to an available lobby ' +
    'when dispatch StartUserAdd and there is an available lobby in lobbies', async () => {
    // GIVEN
    const toBeAddedUser = 'vunguyenhung';

    const lobbies = [createLobby()];

    const expectedResultLobby = addUser(toBeAddedUser, lobbies).merge();

    const expectedAction = {
      type: ActionTypes.ADD_USER,
      payload: expectedResultLobby,
    };

    // STUB
    const store = mockStore({ lobbies });
    sendEventStub.resolves(true);

    // WHEN
    const actualActions = await store.dispatch(StartUserAdd(toBeAddedUser));

    // THEN
    expect(actualActions).toEqual(expectedAction);
    // expectedActions = [];
  });

  xit('should dispatch ADD_USER with new lobby contains new user added ' +
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

    const expectedResultLobby = {
      users: [toBeAddedUsername],
      isClosed: false,
    };

    const expectedActions = [
      {
        type: ActionTypes.ADD_USER,
        payload: expectedResultLobby,
      },
    ];

    // STUB
    const store = mockStore(fullLobbiesState);

    // WHEN
    store.dispatch(StartUserAdd(toBeAddedUsername));
    const actualActions = store.getActions();

    // THEN
    expect(actualActions).toMatchObject(expectedActions);
  });

  xit('should dispatch ADD_USER_FAILED Action ' +
    'when dispatch StartUserAdd and lobbies already containing user', () => {
    // GIVEN
    const existingUser = 'user2';

    const initialLobbies = [{
      id: uuid(),
      users: ['user1', existingUser, 'user3'],
      isClosed: true,
    }];

    const expectedError = addUser(existingUser, initialLobbies).merge();

    const expectedActions = [
      {
        type: ActionTypes.ADD_USER_FAILED,
        payload: expectedError,
      },
    ];

    // STUB
    const store = mockStore({ lobbies: initialLobbies });

    // WHEN
    store.dispatch(StartUserAdd(existingUser));
    const actualActions = store.getActions();

    // THEN
    expect(actualActions).toEqual(expectedActions);
  });

  it('should dispatch REMOVE_USER Action with specified user removed from an containing lobby ' +
    'when dispatch StartUserRemove', async () => {
    // GIVEN
    const toBeRemovedUser = 'user2';

    const initialLobbies = [{
      id: uuid(),
      users: ['user1', toBeRemovedUser, 'user3'],
      isClosed: true,
    }];

    const expectedResultLobby = removeUser(toBeRemovedUser, initialLobbies).merge();

    const expectedActions = {
      type: ActionTypes.REMOVE_USER,
      payload: expectedResultLobby,
    };

    // STUB
    const store = mockStore({ lobbies: initialLobbies });
    sendEventStub.resolves(true);

    // WHEN
    const actualAction = await store.dispatch(StartUserRemove(toBeRemovedUser));

    // THEN
    expect(actualAction).toEqual(expectedActions);
  });

  xit('should dispatch REMOVE_USER_FAILED Action ' +
    'when dispatch StartUserRemove with lobbies not containing user', () => {
    // GIVEN
    const notExistingUser = 'user2';

    const initialLobbies = [{
      id: uuid(),
      users: ['user1', 'user3'],
      isClosed: true,
    }];

    const expectedError = removeUser(notExistingUser, initialLobbies).merge();

    const expectedActions = [
      { type: ActionTypes.REMOVE_USER_FAILED, payload: expectedError },
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
