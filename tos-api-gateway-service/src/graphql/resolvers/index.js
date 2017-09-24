const resolvers = {
  Query: {
    appState() {
      return {};
    },
  },
  Mutation: {
    sendCommand(obj, { command }) {
      return {
        success: [
          {
            message: command.type,
            metadata: command.payload,
          }],
      };
    },
  },
};

exports.resolvers = resolvers;
