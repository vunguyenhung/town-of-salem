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

// TODO: implement StartClosingLobby effect here
// this will dispatch closing lobby 10 times ?

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
      .take(10)
      .do(timeInterval =>
        dispatch(Actions.ClosingLobby({
          lobby: lastUpdatedLobby,
          closedIn: 10 - timeInterval.value,
        })))
      .do(() => dispatch(StartKafkaEventSend({
        topic: 'tos-state-update-events',
        type: '[Lobby] LOBBY_UPDATED',
        payload: R.find(R.eqProps('id', lastUpdatedLobby), getState().lobbies),
      })))
      .subscribe(
        log('After handling Closing Lobby'),
        null,
        () => dispatch(StartKafkaEventSend({
          topic: 'tos-game-events',
          type: '[Game] START_GAME_CREATE',
          payload: lastUpdatedLobby.users,
        })),
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
