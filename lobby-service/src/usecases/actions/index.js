const { createAction } = require('redux-actions');

const ActionTypes = {
  SET_LOBBIES: '[Lobby] Set Lobbies',
};

const SetLobbies = createAction(ActionTypes.SET_LOBBIES);

module.exports = {
  ActionTypes,
  SetLobbies,
};
