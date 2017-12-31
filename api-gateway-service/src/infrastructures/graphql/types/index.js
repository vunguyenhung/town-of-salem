const { RootType } = require('./root.type');
const { AppStateType } = require('./app-state.type');
const { LobbyType } = require('./lobby.type');
const { GameType } = require('./game.type');
const { PlayerType } = require('./player.type');
const { MessageType } = require('./message.type');

exports.types = [
	RootType,
	AppStateType,
	LobbyType,
	GameType,
	PlayerType,
	MessageType,
];
