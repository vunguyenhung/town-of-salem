// language=GraphQL
exports.RootType = `
    input CommandInput {
        type: String!
        payload: String!
    }
    
    input UserInput {
        username: String!
        password: String!
    }

    type Query {
        appState: AppState
        login(user: UserInput!): String!
    }

    type Mutation {
        sendCommand(command: CommandInput!): String!
        register(user: UserInput!): String
    }

    type Subscription {
        stateUpdates: AppState
    }
`;
