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
        register(user: UserInput!): String
    }

    type Subscription {
        stateUpdates: AppState
    }
`;
