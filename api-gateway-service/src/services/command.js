const R = require('ramda');
const { Either } = require('ramda-fantasy');

const { Left, Right } = Either;

const notNil = R.complement(R.isNil());

// To add new command:
// - add type
// - add commandToEvent mapper
// - add mapper to Mappers
// - add validatorFn
// - add validatorFn to Validators

const COMMAND_TYPES = {
  VALID: {
    REGISTER_COMMAND: '[Command] Register',
    LOGIN_COMMAND: '[Command] Login',
    // INFO: add more to here if there's a new command
  },
  INVALID: '[Command] Invalid',
};

const registerCommandToEvents = command => ([
  {
    type: '[Event] Start Register',
    payload: command.payload,
  }]);

const loginCommandToEvents = command => ([
  {
    type: '[Event] Start Login',
    payload: command.payload,
  }]);

const invalidCommandToEvent = command => ([
  {
    type: '[Event] Invalid Command Received',
    payload: command.payload,
  }]);
// INFO: write more commandToEvent mapper here if there's a new command

const commandToEventsMappers = {
  [COMMAND_TYPES.VALID.REGISTER_COMMAND]: registerCommandToEvents,
  [COMMAND_TYPES.VALID.LOGIN_COMMAND]: loginCommandToEvents,
  // INFO: add more to here if there's a new command
  [COMMAND_TYPES.INVALID]: invalidCommandToEvent,
};

const isValidCommandShape = command => R.where({
  type: notNil,
})(command);

const isValidCommandType = ({ type }) =>
  R.contains(type)(R.values(COMMAND_TYPES.VALID));

const isValidRegisterCommandPayload = ({ payload }) => R.where({
  username: notNil,
  password: notNil,
})(payload);

const isValidLoginCommandPayload = ({ payload }) => R.where({
  username: notNil,
  password: notNil,
})(payload);

// INFO: write more validateFn here if there's a new command

const commandPayloadValidators = {
  [COMMAND_TYPES.VALID.REGISTER_COMMAND]: isValidRegisterCommandPayload,
  [COMMAND_TYPES.VALID.LOGIN_COMMAND]: isValidLoginCommandPayload,
// INFO: add more to here if there's a new command
};

const isValidCommandPayload = command =>
  commandPayloadValidators[command.type](command);

// TODO: add ability to determine command should have payload or not based on command type
const validate = (command) => {
  const createInvalidCommand = R.curry((cmd, reason) => ({
    type: COMMAND_TYPES.INVALID,
    payload: { reason, command: cmd },
  }))(command);

  const validateCommand = (cmd, validatorFn, reason) => (
    validatorFn(cmd) ? Right(cmd) : Left(createInvalidCommand(reason))
  );

  const validateCommandShape = cmd =>
    validateCommand(cmd, isValidCommandShape, 'Invalid shape');

  const validateCommandType = cmd =>
    validateCommand(cmd, isValidCommandType, 'Invalid type');

  const validateCommandPayload = cmd =>
    validateCommand(cmd, isValidCommandPayload, 'Invalid payload');

  const alwaysIdentity = Either.either(R.identity, R.identity);

  return alwaysIdentity(validateCommandShape(command)
    .chain(validateCommandType)
    .chain(validateCommandPayload));
};

const _commandToEvents = command => commandToEventsMappers[command.type](command);

const preprocess = (command) => {
  const parse = value => R.tryCatch(JSON.parse, () => value)(value);
  return R.mapObjIndexed(parse, command);
};

// RED - GREEN - REFACTOR
const commandToEvents = command => R.pipe(preprocess, validate, _commandToEvents)(command);

exports.commandToEvents = commandToEvents;
