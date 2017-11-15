/*
Project file imports
 */
const { authenticationResolver } = require('./authentication.resolver');
const { sendJoinLobbyEvent, sendLeaveLobbyEvent } = require('../../../usecases/lobby');

const joinLobby = authenticationResolver.createResolver((root, args, { username }) =>
  sendJoinLobbyEvent(username).run().promise());

const leaveLobby = authenticationResolver.createResolver((root, args, { username }) =>
  sendLeaveLobbyEvent(username).run().promise());

module.exports = {
  lobby: {
    Mutation: {
      joinLobby,
      leaveLobby,
    },
  },
};
