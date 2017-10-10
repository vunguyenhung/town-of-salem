// language=GraphQL
exports.RootType = `
    input CommandInput {
        type: String!
        payload: String!
    }

    type Query {
        appState: AppState
    }

    type Mutation {
        sendCommand(command: CommandInput!): String!
    }
`;
