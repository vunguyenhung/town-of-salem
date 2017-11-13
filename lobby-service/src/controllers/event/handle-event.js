/*
3rd Party imports
 */
const R = require('ramda');
const Task = require('folktale/concurrency/task');

/*
Project file imports
 */
const Effects = require('../../usecases/redux/effects');
const { store } = require('../../usecases/redux');
const { ActionTypes } = require('../../usecases/redux/actions');

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

// TODO: how to close lobby and create game ?
const dispatchThunk = thunk =>
  Task.fromPromised(store.dispatch(thunk));

// handleEvent :: Event -> Task String
const handleEvent = event =>
  Task.of(eventToThunk(event))
    .chain(dispatchThunk);

module.exports = {
  KafkaEventTypes,
  eventToThunk,
  handleEvent,
};

