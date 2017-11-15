/*
3rd Party library imports
 */
const Result = require('folktale/result');
const R = require('ramda');
const log = require('debug')('src:effect');

/*
Project file imports
 */
const Entity = require('../../entity/index');
const Actions = require('./actions');
const { selectLobbies } = require('./reducers');
const Utils = require('./utils');

const errorToAction = lobbyError =>
  lobbyError.matchWith({
    NoLobbyAvailable: ({ lobbies, username }) =>
      Result.of(Entity.addLobby(lobbies))
        .chain(Entity.addUser(username))
        .map(Actions.AddUser)
        .merge(),
    LobbiesAlreadyContainsUser: Actions.AddUserFailed,
    LobbiesNotContainUsername: Actions.RemoveUserFailed,
  });

// TODO: implement StartClosingLobby effect here
// this will dispatch closing lobby 10 times ?

const StartKafkaEventSend = ({ topic, type, payload }) => dispatch =>
  Utils.sendEvent(topic, type, payload)
    .run().promise() // payload is lobby
    .then(() => dispatch(Actions.SendKafkaEvent({ topic, type, payload })));

// TODO: refactor this
const StartUserAdd = username => (dispatch, getState) => {
  dispatch(Actions.AddUser(username));
  const { lobbies } = getState();
  const lastUpdatedLobby = R.reduce(R.maxBy(R.prop('updatedAt')), lobbies[0])(lobbies);
  return dispatch(StartKafkaEventSend({
    topic: 'tos-state-update-events',
    type: '[Lobby] LOBBY_UPDATED',
    payload: lastUpdatedLobby,
  }));
};

// // StartUserAdd :: String -> (dispatch, getState) -> Promise
// const StartUserAdd = username => (dispatch, getState) =>
//   Entity.addUser(username, selectLobbies(getState()))
//     .matchWith({
//       Ok: ({ value }) => // value == lobby
//         // TODO: do something here in the case lobby is full after add.
//         // check if lobby in value is closed or not after add user.
//         // if yes, dispatch startLobbyAdd(), then dispatch startGameCreate effect
//         Utils.sendEvent('tos-state-update-events', '[Lobby] LOBBY_UPDATED', value)
//           .then(() => dispatch(Actions.AddUser(value))),
//       Error: ({ value }) => dispatch(errorToAction(value)),
//       // TODO: refactor this, this not return a Promise
//       // INFO: because initially, there's no lobby, so it will go to Error,
//       // but since Error didn't return a Promise so it show an error
//       // we no need to care about this now
//       // do something to recover from error, then dispatch StartUserAdd again
//     });

const StartUserRemove = username => (dispatch, getState) => {
  dispatch(Actions.RemoveUser(username));
  const { lobbies } = getState();
  const lastUpdatedLobby = R.reduce(R.maxBy(R.prop('updatedAt')), lobbies[0])(lobbies);
  return dispatch(StartKafkaEventSend({
    topic: 'tos-state-update-events',
    type: '[Lobby] LOBBY_UPDATED',
    payload: lastUpdatedLobby,
  }));
};

// const StartUserRemove = username => (dispatch, getState) =>
//   Entity.removeUser(username, selectLobbies(getState()))
//     .matchWith({
//       Ok: ({ value }) =>
//         Utils.sendEvent('tos-state-update-events', '[Lobby] LOBBY_UPDATED', value)
//           .then(() => dispatch(Actions.RemoveUser(value))),
//       // Error: ({ value }) => dispatch(errorToAction(value)),
//     });

module.exports = {
  StartUserAdd,
  StartUserRemove,
};
