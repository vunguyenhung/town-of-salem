const { publishToStateUpdatesChannel } = require('../graphql/pubsub');
const { consumerManager } = require('../kafka/consumer');

const createEventProcessor = () => {
  const publishAppStateToClient = (appState) => {
    const publishingResult = publishToStateUpdatesChannel({ stateUpdates: appState });
    return {
      publishingResult,
      appState,
    };
  };

  /**
   *
   * TODO: implement the details
   * message shape:
   {
      topic: 'tos-state-changes-events',
      value: '{"type":"[Event] Start Register",...',
      offset: 24,
      partition: 0,
      highWaterOffset: 25,
      key: null
   }
   * shape of the result must match with AppState
   *
   */
  const messageToAppState = message => ({
    test: message.value,
  });

  const start = () => {
    consumerManager
      .onMessage()
      .map(messageToAppState)
      .map(publishAppStateToClient)
      .subscribe(result => console.log('Publishing result: ', result));
  };

  return {
    start,
  };
};

exports.eventProcessor = createEventProcessor();

