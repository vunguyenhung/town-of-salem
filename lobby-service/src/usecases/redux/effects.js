/*
3rd Party library imports
 */
const R = require('ramda');
const Rx = require('rxjs');
const Result = require('folktale/result');
const log = require('debug')('src:effect');

/*
Project file imports
 */
const Actions = require('./actions');
const Utils = require('./utils');
const { findLobbyByID } = require('./reducers');

const StartKafkaEventSend = ({ topic, type, payload }) => dispatch =>
  Utils.sendEvent(topic, type, payload)
    .run().promise() // payload is lobby
    .then(() => dispatch(Actions.SendKafkaEvent({ topic, type, payload })));

const StartUserAdd = username => (dispatch, getState) => {
  dispatch(Actions.AddUser(username));
  const { lobbies } = getState();
  const lastUpdatedLobby = R.reduce(R.maxBy(R.prop('updatedAt')), lobbies[0])(lobbies);
  const toBeReturned = dispatch(StartKafkaEventSend({
    topic: 'tos-state-update-events',
    type: '[Lobby] LOBBY_UPDATED',
    payload: lastUpdatedLobby,
  }));
  if (lastUpdatedLobby.isClosed) {
    Rx.Observable.interval(1000)
      .timeInterval()
      .takeWhile((timeInterval) => {
        log('time Interval 0: ', timeInterval);
        log('lobby found: ', findLobbyByID(lastUpdatedLobby.id)(getState()));
        return timeInterval.value !== 10
          && +findLobbyByID(lastUpdatedLobby.id)(getState()).isClosed !== 0;
      })
      .do((timeInterval) => {
        log('timeInterval 1: ', timeInterval);
        return dispatch(Actions.ClosingLobby({
          lobby: lastUpdatedLobby,
          closedIn: 10 - timeInterval.value,
        }));
      })
      .do((timeInterval) => {
        log('timeInterval 2: ', timeInterval);
        return dispatch(StartKafkaEventSend({
          topic: 'tos-state-update-events',
          type: '[Lobby] LOBBY_UPDATED',
          payload: findLobbyByID(lastUpdatedLobby.id)(getState()),
        }));
      })
      .subscribe(
        value => log('After handling Closing Lobby: ', value),
        //   TimeInterval { value: i, interval: 1007 }
        null,
        () => {
          if (+findLobbyByID(lastUpdatedLobby.id)(getState()).isClosed === 1) {
            return dispatch(StartKafkaEventSend({
              topic: 'tos-game-events',
              type: '[Game] START_GAME_CREATE',
              payload: lastUpdatedLobby.users,
            }));
          }
          return 0;
        }
        ,
      );
  }
  return toBeReturned;
};

const StartUserRemove = username => (dispatch, getState) => {
  dispatch(Actions.RemoveUser(username));
  const { lobbies } = getState();
  const lastUpdatedLobby = R.reduce(R.maxBy(R.prop('updatedAt')), lobbies[0])(lobbies);
  return dispatch(StartKafkaEventSend({
    topic: 'tos-state-update-events',
    type: '[Lobby] LOBBY_UPDATED',
    payload: lastUpdatedLobby,
  }));
};

module.exports = {
  StartUserAdd,
  StartUserRemove,
};
