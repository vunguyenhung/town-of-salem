const MESSAGE = {
  START_UP_SERVICE_STARTING: '------STARTING STARTUP SERVICE------',
  START_UP_SERVICE_STARTED: '------STARTUP SERVICE STARTED------',
  EVENT_PROCESSOR_STARTED: 'Event processor started!',
  KAFKA_PRODUCER_READY: 'Kafka Producer ready!',
  KAFKA_PRODUCER_SENT: 'Events sent successfully!',
  KAFKA_PRODUCER_ERROR: 'There is something went wrong with Kafka Producer!',
  KAFKA_CONSUMER_READY: 'Kafka Consumer ready!',
  DEFAULT_INVALID_COMMAND_ERROR: 'Invalid Command',
  DEFAULT_PUBLISH_EVENTS_ERROR: 'Error while sending events',
  DEFAULT_INVALID_LOGIN_ERROR: 'Login attempt failed',
  DEFAULT_INVALID_REGISTER_ERROR: 'Register attempt failed',
  REGISTRATION_SUCCESS: 'Registration successfully!',
};

module.exports = MESSAGE;
