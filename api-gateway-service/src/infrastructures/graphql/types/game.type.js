// language=GraphQL
exports.GameType = `
    type Game {
        _id: String!
		    phase: String
		    time: Int
        players: [Player]!
        createdAt: String!
        updatedAt: String!
        ended: Boolean
    }
`;
