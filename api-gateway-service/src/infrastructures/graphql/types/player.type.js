// language=GraphQL
exports.PlayerType = `
    type Player {
        username: String!,
        died: Boolean,
        updatedAt: String,
        createdAt: String,
        isPlaying: Boolean,
        lastWill: String
    }
`;
