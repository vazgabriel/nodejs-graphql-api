import { makeExecutableSchema } from 'graphql-tools';

const SchemaDefinition = `
  type Schema {
    query: Query
    mutation: Mutation
  }
`;

export default makeExecutableSchema({
  typeDefs: [

  ]
});