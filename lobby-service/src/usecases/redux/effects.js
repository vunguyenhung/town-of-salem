/*
3rd Party library imports
 */
const R = require('ramda');
const Result = require('folktale/result');

/*
Project file imports
 */
const { addUser, addLobby, removeUser } = require('../../entities/index');
const { SetLobbies, SetLobbiesFailed } = require('./actions');
const { lobbiesSelector } = require('./reducers');

const StartLobbyAdd = () => (dispatch, getState) =>
  R.pipe(
    addLobby,
    SetLobbies,
    dispatch,
  )(lobbiesSelector(getState()));

const errorToAction = lobbyError =>
  lobbyError.matchWith({
    NoLobbyAvailable: ({ lobbies, username }) =>
      Result.of(addLobby(lobbies))
        .chain(addUser(username))
        .map(SetLobbies)
        .merge(),
    LobbiesAlreadyContainsUser: SetLobbiesFailed,
    LobbiesNotContainUsername: SetLobbiesFailed,
  });

// TODO: implement StartGameCreate effect here

const StartUserAdd = username => (dispatch, getState) =>
  addUser(username, lobbiesSelector(getState())).matchWith({
    // TODO: handle the case when lobby is full after addUser
    Ok: ({ value }) => dispatch(SetLobbies(value)),
    Error: ({ value }) => dispatch(errorToAction(value)),
  });

const StartUserRemove = username => (dispatch, getState) =>
  removeUser(username, lobbiesSelector(getState())).matchWith({
    Ok: ({ value }) => dispatch(SetLobbies(value)),
    Error: ({ value }) => dispatch(errorToAction(value)),
  });

module.exports = {
  StartUserAdd,
  StartLobbyAdd,
  StartUserRemove,
};
