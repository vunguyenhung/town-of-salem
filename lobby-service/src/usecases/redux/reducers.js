/*
3rd Party imports
 */
const { handleActions } = require('redux-actions');
const { createSelector } = require('reselect');
const R = require('ramda');

/*
Project file imports
 */
const Actions = require('./actions');
const Entity = require('../../entity/');
const log = require('debug')('src:reducers');

const initialState = {
  lobbies: [],
  lastEvent: null,
};

// TODO: refactor this
const reducer = handleActions({
  [Actions.AddUser]: (state, { payload }) => ({
    // convert lobbies :: [Lobby] to lobbies :: {[id :: String] :: Lobby} here
    lobbies: Entity.addUser(payload, state.lobbies).getOrElse(state.lobbies),
  }),
  [Actions.RemoveUser]: (state, { payload }) => ({
    lobbies: Entity.removeUser(payload, state.lobbies).getOrElse(state.lobbies),
  }),
  [Actions.ClosingLobby]: (state, { payload }) => {
    log('payload: ', payload);
    return ({
      lobbies: Entity.updateLobbyInLobbies(payload.lobby, payload.closedIn, state.lobbies)
        .getOrElse(state.lobbies),
    });
  },
  [Actions.SendKafkaEvent]: (state, { payload }) => ({ ...state, lastEvent: payload }),
}, initialState);

const selectLobbies = state => state.lobbies;

const findLobbyByID = id => createSelector(selectLobbies, R.find(R.propEq('id', id)));

module.exports = {
  reducer,
  selectLobbies,
  findLobbyByID,
};
