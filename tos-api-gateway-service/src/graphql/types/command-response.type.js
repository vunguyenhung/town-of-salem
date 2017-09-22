// language=GraphQL
exports.CommandResponseDataType = `
    type CommandResponseData {
        message: String,
        metadata: String
    }
`;
// language=GraphQL
exports.CommandResponseType = `
    type CommandResponse {
        success: [CommandResponseData]
    }
`;
