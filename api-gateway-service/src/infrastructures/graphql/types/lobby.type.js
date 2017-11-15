// language=GraphQL
exports.LobbyType = `
    type Lobby {
        id: String!,
        users: [String]!,
        isClosed: Boolean,
        updatedAt: String!
    }
`;
