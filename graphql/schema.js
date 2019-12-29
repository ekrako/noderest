const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  type TestData {
    text: String!
    views: Int!
  }

  type Query{
    hello: TestData
  }

  schema {
    query: Query
  }
`)