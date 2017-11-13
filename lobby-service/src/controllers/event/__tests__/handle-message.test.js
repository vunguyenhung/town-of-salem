/*
3rd Party library imports
 */
const sinon = require('sinon');
const log = require('debug')('src:handle-message.test');

/*
Project file imports
 */
const { KafkaEventTypes } = require('../handle-event');
const MessageHandler = require('../handle-message');

describe('Handle event', () => {
  it('should map message to event correctly', () => {
    // GIVEN
    const validUser = 'vunguyenhung';

    const expectedEvent = {
      type: KafkaEventTypes.USER_JOIN,
      payload: validUser,
    };

    const message = {
      topic: 'valid-topic',
      value: JSON.stringify(expectedEvent),
      offset: 1,
      partition: 0,
      highWaterOffset: 3,
      key: null,
    };

    // WHEN
    const actualEvent = MessageHandler.messageToEvent(message);

    // THEN
    expect(actualEvent).toEqual(expectedEvent);
  });

  xit('should handle message correctly', async () => {
    // GIVEN
    const validUser = 'vunguyenhung';

    const expectedEvent = {
      type: KafkaEventTypes.USER_JOIN,
      payload: validUser,
    };

    const message = {
      topic: 'valid-topic',
      value: JSON.stringify(expectedEvent),
      offset: 1,
      partition: 0,
      highWaterOffset: 3,
      key: null,
    };

    // STUB
    // can't spy on function called by Task.
    const messageToEventSpy = sinon.spy(MessageHandler, 'messageToEvent');

    // WHEN
    const actualResult = await MessageHandler.handleMessage(message)
      .run()
      .promise();
    log(actualResult);

    // spy messageToEvent to see if it is called and received correct arg
    // spy handleEvent to see if it is called and received correct arg
    //    spy store.dispatch() to see if
    // const actualEvent = messageToEvent(message);

    // THEN
    // expect(actualEvent).toEqual(expectedEvent);
    // expect(messageToEventSpy.calledOnce).toBeTruthy();
  });
});
