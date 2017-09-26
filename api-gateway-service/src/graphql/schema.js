const graphqlTools = require('graphql-tools');
const { types } = require('./types');
const { resolvers } = require('./resolvers');

// language=GraphQL
const SchemaDef = `
    schema {
        query: Query,
        mutation: Mutation,
    }
`;

exports.schema = graphqlTools.makeExecutableSchema({
  typeDefs: [
    SchemaDef,
    ...types,
  ],
  resolvers,
});
