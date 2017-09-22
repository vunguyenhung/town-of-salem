const rootType = require('./root.type');
const commandResponseType = require('./command-response.type');
const appStateType = require('./app-state.type');
const guestStateType = require('./guest-state.type');

exports.default = [
  rootType.RootType,
  commandResponseType.CommandResponseType,
  commandResponseType.CommandResponseDataType,
  appStateType.AppStateType,
  guestStateType.GuestStateType,
];
