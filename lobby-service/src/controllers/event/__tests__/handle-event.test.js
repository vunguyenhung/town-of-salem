/*
3rd Party library imports
 */
const sinon = require('sinon');
// const log = require('debug')('src:controller:event-to-thunk.test');

/*
Project file imports
 */
const { KafkaEventTypes, eventToThunk } = require('../handle-event');
const Effects = require('../../../usecases/redux/effects');

describe('Handle event', () => {
  it('should handle USER_JOIN event correctly', () => {
    // SETUP
    const startUserAddSpy = sinon.spy(Effects, 'StartUserAdd');

    // GIVEN
    const joiningUser = 'vunguyenhung';

    const toBeMappedEvent = {
      type: KafkaEventTypes.USER_JOIN,
      payload: joiningUser,
    };

    // WHEN
    eventToThunk(toBeMappedEvent);

    // THEN
    expect(startUserAddSpy.calledOnce).toBeTruthy();
    expect(startUserAddSpy.calledWith(joiningUser)).toBeTruthy();
  });

  it('should handle USER_LEAVE event correctly', () => {
    // SETUP
    const startUserRemoveSpy = sinon.spy(Effects, 'StartUserRemove');

    // GIVEN
    const leavingUser = 'vunguyenhung';

    const toBeMappedEvent = {
      type: KafkaEventTypes.USER_LEAVE,
      payload: leavingUser,
    };

    // WHEN
    eventToThunk(toBeMappedEvent);

    // THEN
    expect(startUserRemoveSpy.calledOnce).toBeTruthy();
    expect(startUserRemoveSpy.calledWith(leavingUser)).toBeTruthy();
  });
});
