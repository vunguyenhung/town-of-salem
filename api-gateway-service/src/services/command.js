/*
3rd Party imports
 */
const R = require('ramda');
const Result = require('folktale/result');
const Task = require('folktale/concurrency/task');

/*
Project file imports
 */
const { TOPICS } = require('../kafka/producer');
const { InvalidCommandError } = require('../graphql/errors');

// createKafkaMessage :: String -> Any -> { topic :: String, messages :: String }
const createKafkaMessage =
  R.curry((topic, message) => ({ topic, messages: JSON.stringify(message) }));

// Any -> Boolean
const notNil = R.complement(R.isNil);

const COMMANDS = {
  DO_SOMETHING: {
    toKafkaMessage: createKafkaMessage(TOPICS.SOME_TOPIC),
    checkPayload: command => R.where({ requiredData: notNil })(command.payload),
  },
};

// Command :: {type :: String, payload :: String}
// preprocess :: Command -> {type :: String, payload :: Any}
const preprocess = (command) => {
  const parse = value => R.tryCatch(JSON.parse, () => value)(value);
  return R.mapObjIndexed(parse, command);
};

// Command :: {type :: String, payload :: Any}
// validate :: Command -> Result String Command
const validate = (command) => {
  const validateType = cmd =>
    (R.contains(cmd.type)(R.keys(COMMANDS))
      ? Result.Ok(cmd)
      : Result.Error(new InvalidCommandError({ message: 'Invalid type' })));

  const validatePayload = cmd =>
    (COMMANDS[cmd.type].checkPayload(cmd)
      ? Result.Ok(cmd)
      : Result.Error(new InvalidCommandError({ message: 'Invalid payload' })));

  return validateType(command).chain(validatePayload);
};

// Command :: {type :: String, payload :: Any}
// KafkaMessage :: {topic :: String, message :: String}
// toKafkaMessage :: Command -> KafkaMessage
const toKafkaMessage = command =>
  COMMANDS[command.type].toKafkaMessage(command);

// Command :: {type :: String, payload :: String}
// KafkaMessage :: {topic :: String, message :: String}
// commandToResult :: Command -> Result InvalidCommandError KafkaMessage
const commandToResult = command =>
  Result.of(command)
    .map(preprocess)
    .chain(validate)
    .map(toKafkaMessage);

// Command :: {type :: String, payload :: String}
// commandToTask :: Command -> Task Error Message
const commandToTask = command =>
  commandToResult(command).matchWith({
    Ok: ({ value }) => Task.of(value),
    Error: ({ value }) => Task.rejected(value),
  });

module.exports = {
  commandToResult,
  commandToTask,
};
