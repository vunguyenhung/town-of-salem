// language=GraphQL
exports.GameType = `
    type Game {
        id: String!,
        users: [User]!,
        createdAt: String!,
        updatedAt: String!
    }
`;
