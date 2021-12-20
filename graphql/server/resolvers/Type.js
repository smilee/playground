import { GraphQLScalarType } from 'graphql'

export default {
  Photo: {
    id: (parent) => parent.id || parent._id,
    url: (parent) => `/img/photos/${parent._id}.jpg`,
    postedBy: (parent, args, { db }) => db.collection('users').findOne({ githubLogin: parent.userID }),
    taggedUsers: (parent) => tags
      .filter((tag) => tag.photoID === parent.id)
      .map((tag) => tag.userID)
      .map((userID) => users.find((user) => user.githubLogin === userID)),
  },
  User: {
    postedPhotos: (parent) => photos.filter((photo) => photo.githubUser === parent.githubLogin),
    inPhotos: (parent) => tags
      .filter((tag) => tag.userID === parent.githubLogin)
      .map((tag) => tag.photoID)
      .map((photoID) => photos.find((photo) => photo.id === photoID)),
  },
  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    description: 'A valid date time value',
    parseValue: (value) => new Date(value), // resolver
    serialize: (value) => new Date(value).toISOString(), // typeDef
    parseLiteral: (ast) => ast.value,
  }),
};
