const { handleActions } = require('redux-actions');
const { SetLobbies } = require('./actions');

const initialState = {
  lobbies: [],
};

const reducer = handleActions({
  // QUESTION: can we refactor this?
  [SetLobbies]: (state, { payload }) => ({ lobbies: payload }),
}, initialState);

const lobbiesSelector = state => state.lobbies;

module.exports = {
  reducer,
  lobbiesSelector,
};
