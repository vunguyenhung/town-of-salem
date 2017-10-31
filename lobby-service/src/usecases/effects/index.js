/*
3rd Party library imports
 */
const R = require('ramda');
const Result = require('folktale/result');

/*
Project file imports
 */
const { addUser, addLobby } = require('../../entities');
const { SetLobbies } = require('../actions');
const { lobbiesSelector } = require('../reducers');

const StartLobbyAdd = () => (dispatch, getState) =>
  R.pipe(
    addLobby,
    SetLobbies,
    dispatch,
  )(lobbiesSelector(getState()));

const StartUserAdd = username => (dispatch, getState) =>
  addUser(username, lobbiesSelector(getState())).matchWith({
    Ok: ({ value }) => dispatch(SetLobbies(value)),
    // TODO: move this to handleLobbyError function when needed
    Error: ({ value }) => value.matchWith({
      NoLobbyAvailable: () =>
        Result.of(addLobby(lobbiesSelector(getState())))
          .chain(addUser(username))
          .map(SetLobbies)
          .map(dispatch)
          .merge(),
    }),
  });

module.exports = {
  StartUserAdd,
  StartLobbyAdd,
};
