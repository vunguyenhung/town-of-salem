// language=GraphQL
exports.GameType = `
    type Game {
        _id: String!,
        players: [Player]!,
        createdAt: String!,
        updatedAt: String!
    }
`;
