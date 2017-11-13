/*
3rd Party imports
 */
const { handleActions } = require('redux-actions');
const R = require('ramda');

/*
Project file imports
 */
const Actions = require('./actions');

const initialState = {
  lobbies: [],
};

// updateLobbies :: Array Lobby -> Lobby -> Array Lobby
const _updateLobbies = R.curry((toBeUpdatedLobbies, subjectLobby) =>
  R.map(originalLobby =>
    (R.eqProps('id', originalLobby, subjectLobby)
      ? subjectLobby
      : originalLobby))(toBeUpdatedLobbies));

// State :: { lobbies: [Lobby] }
// Action :: { type: String, payload :: Any }
// updateLobbies :: (State, Action) -> State
const updateLobbies = (state, { payload }) => ({
  lobbies: _updateLobbies(state.lobbies, payload),
});

const reducer = handleActions({
  [Actions.AddUser]: updateLobbies,
  [Actions.RemoveUser]: updateLobbies,
  [Actions.ClosingLobby]: updateLobbies,
}, initialState);

const selectLobbies = state => state.lobbies;

module.exports = {
  reducer,
  selectLobbies,

  // export for testing purpose
  _updateLobbies,
};
