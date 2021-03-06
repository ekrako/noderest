const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  type Post {
    _id: ID!
    title:String!
    content:String!
    imageUrl:String!
    creator: User!
    createdAt: String!
    updatedAt: String!
  }

  type User{
    _id: ID!
    email: String!
    name: String!    
    password: String
    status: String!
    posts: [Post!]!
  }
  input UserInputData {
    email: String!
    name: String!    
    password: String!
  }

  type AuthData {
    token:String!
    userId:String!
  }
  
  type RootMotation {
    createUser(userInput: UserInputData):User!
    createPost(title:String!,content:String!,userId:String!,token:String):Post!
  }

  type RootQuery {
    login(email: String!, password: String! ):AuthData!
  }

  

  schema {
    query:RootQuery
    mutation:RootMotation
  }
`);
