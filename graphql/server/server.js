import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginLandingPageProductionDefault, ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';

export function createApolloServer({ typeDefs, resolvers, context }) {
  const { db } = context;
  
  return new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    context: async ({ req }) => {
      const githubToken = req.headers.authorization || '';
      const currentUser = await db.collection('users').findOne({ githubToken });

      return { db, currentUser };
    },
    plugins: [
    process.env.NODE_ENV === 'production' ?
      ApolloServerPluginLandingPageProductionDefault({ footer: false }) :
      ApolloServerPluginLandingPageLocalDefault({ footer: false })
    ]
  });
}

export default {};
