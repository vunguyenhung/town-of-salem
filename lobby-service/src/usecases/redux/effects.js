/*
Project file imports
 */
const Entity = require('../../entities/index');
const Actions = require('./actions');
const { selectLobbies } = require('./reducers');
const Utils = require('./utils');

// const errorToAction = lobbyError =>
//   lobbyError.matchWith({
//     NoLobbyAvailable: ({ lobbies, username }) =>
//       Result.of(Entity.addLobby(lobbies))
//         .chain(Entity.addUser(username))
//         .map(Actions.AddUser)
//         .merge(),
//     LobbiesAlreadyContainsUser: Actions.AddUserFailed,
//     LobbiesNotContainUsername: Actions.RemoveUserFailed,
//   });

// TODO: implement StartClosingLobby effect here
// this will dispatch closing lobby 10 times ?

const StartUserAdd = username => (dispatch, getState) =>
  Entity.addUser(username, selectLobbies(getState())) // result Lobby
    .matchWith({
      Ok: ({ value }) => // value == lobby
        // TODO: do something here in the case lobby is full after add.
        // check if lobby in value is closed or not after add user.
        // if yes, dispatch startLobbyAdd(), then dispatch startGameCreate effect
        Utils.sendEvent('tos-state-update-events', '[Lobby] LOBBY_UPDATED', value)
          .then(() => dispatch(Actions.AddUser(value))),
      // Error: ({ value }) => dispatch(errorToAction(value)),
      // we no need to care about this now
      // do something to recover from error, then dispatch StartUserAdd again
    });

const StartUserRemove = username => (dispatch, getState) =>
  Entity.removeUser(username, selectLobbies(getState()))
    .matchWith({
      Ok: ({ value }) =>
        Utils.sendEvent('tos-state-update-events', '[Lobby] LOBBY_UPDATED', value)
          .then(() => dispatch(Actions.RemoveUser(value))),
      // Error: ({ value }) => dispatch(errorToAction(value)),
    });

module.exports = {
  StartUserAdd,
  StartUserRemove,
};
