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
        currentState: AppState
        login(user: UserInput!): String!
    }

    type Mutation {
        register(user: UserInput!): String,
        joinLobby(token: String!): String
        leaveLobby(token: String!): String
    }

    type Subscription {
        stateUpdates(token: String!): AppState
    }
`;
