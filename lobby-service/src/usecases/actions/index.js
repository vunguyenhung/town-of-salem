const { createAction } = require('redux-actions');

const ActionTypes = {
  SET_LOBBIES: '[Lobby] Set Lobbies',
  SET_LOBBIES_FAILED: '[Lobby] Set Lobbies Failed',
};

const SetLobbies = createAction(ActionTypes.SET_LOBBIES);
const SetLobbiesFailed = createAction(ActionTypes.SET_LOBBIES_FAILED);

module.exports = {
  ActionTypes,
  SetLobbies,
  SetLobbiesFailed,
};
