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

    input PlayerInput {
        username: String!
        died: Boolean!
        role: String!
    }

    type Query {
        currentState(token: String!): AppState
        login(user: UserInput!): String!
    }

    type Mutation {
        register(user: UserInput!): String
        joinLobby(token: String!): String
        leaveLobby(token: String!): String
        updateLastWill(token: String!, lastWill: String!): String
        interact(gameId: String!, source: PlayerInput!, target: PlayerInput!): String
    }

    type Subscription {
        stateUpdates(token: String!): AppState
    }
`;
