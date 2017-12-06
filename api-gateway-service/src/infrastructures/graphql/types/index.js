const { RootType } = require('./root.type');
const { AppStateType } = require('./app-state.type');
const { LobbyType } = require('./lobby.type');
const { GameType } = require('./game.type');
const { UserType } = require('./user.type');

exports.types = [
	RootType,
	AppStateType,
	LobbyType,
	GameType,
	UserType,
];
