/*
3rd Party imports
 */
const R = require('ramda');
const Task = require('folktale/concurrency/task');
const log = require('debug')('src:handle-event');
/*
Project file imports
 */
const Effects = require('../../usecases/redux/effects');
const { store } = require('../../usecases/redux');
const { trace } = require('../../utils');

const KafkaEventTypes = {
  USER_JOIN: '[Lobby] USER_JOIN',
  USER_LEAVE: '[Lobby] USER_LEAVE',
};

const EventToThunkMapperFns = {
  [KafkaEventTypes.USER_JOIN]: event => Effects.StartUserAdd(event.payload),
  [KafkaEventTypes.USER_LEAVE]: event => Effects.StartUserRemove(event.payload),
};

const _eventToThunk = R.curry((mapperFns, event) => mapperFns[event.type](event));

// eventToThunk :: Event -> (dispatch, getState) -> Action
const eventToThunk = _eventToThunk(EventToThunkMapperFns);

const dispatchThunk = thunk => Task.task((r) => {
  // log('thunk: ', thunk);
  const actionResult = store.dispatch(thunk);
  // log('actionResult: ', actionResult);
  return actionResult.then(r.resolve);
});

// handleEvent :: Event -> Task String
const handleEvent = event =>
  Task.of(eventToThunk(event))
    .chain(dispatchThunk)
    .map(trace('after dispatch thunk: '));

module.exports = {
  KafkaEventTypes,
  eventToThunk,
  handleEvent,
};

