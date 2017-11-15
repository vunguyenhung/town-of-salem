/*
3rd Party imports
 */
const { handleActions } = require('redux-actions');
const R = require('ramda');

/*
Project file imports
 */
const Actions = require('./actions');
const { addUser, removeUser } = require('../../entity/');
const log = require('debug')('src:reducers');

const initialState = {
  lobbies: [],
  lastEvent: null,
};

// updateOrAppend :: Array Lobby -> Lobby -> Array Lobby
const updateOrAppend = R.curry((sourceLobbies, subjectLobby) => {
  const index = R.findIndex(R.eqProps('id', subjectLobby))(sourceLobbies);
  return R.equals(index, -1)
    ? R.append(subjectLobby)(sourceLobbies)
    : R.update(index, subjectLobby)(sourceLobbies);
});

// State :: { lobbies: [Lobby] }
// Action :: { type: String, payload :: Any }
// updateLobbies :: (State, Action) -> State
const updateLobbies = (state, { payload }) => ({
  lobbies: updateOrAppend(state.lobbies, payload),
});

const reducer = handleActions({
  [Actions.AddUser]: (state, { payload }) => ({
    lobbies: addUser(payload, state.lobbies).getOrElse(state.lobbies),
  }),
  // how about Error case? don't care about it now
  [Actions.RemoveUser]: (state, { payload }) => ({
    lobbies: removeUser(payload, state.lobbies).getOrElse(state.lobbies),
  }),
  [Actions.ClosingLobby]: updateLobbies,
  [Actions.SendKafkaEvent]: (state, { payload }) => ({ ...state, lastEvent: payload }),
}, initialState);

const selectLobbies = state => state.lobbies;

module.exports = {
  reducer,
  selectLobbies,
};
