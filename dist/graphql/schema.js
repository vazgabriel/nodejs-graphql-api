"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tools_1 = require("graphql-tools");
const SchemaDefinition = `
  type Schema {
    query: Query
    mutation: Mutation
  }
`;
exports.default = graphql_tools_1.makeExecutableSchema({
    typeDefs: []
});
