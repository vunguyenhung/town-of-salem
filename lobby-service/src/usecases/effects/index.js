const { addUser } = require('../../entities');
const { SetLobbies } = require('../actions');
const { lobbiesSelector } = require('../reducers');

// (dispatch) => dispatch()
const StartUserAdd = username => (dispatch, getState) =>
  addUser(username, lobbiesSelector(getState())).matchWith({
    Ok: ({ value }) => dispatch(SetLobbies(value)),
    // handle error this later
    // Error: ({ value }) => , // we can nest Result here using dispatch().chain...
  });

module.exports = {
  StartUserAdd,
};
