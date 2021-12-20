import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8');
import resolvers from './resolvers';

import { createApolloServer } from './server.js';

const { log } = console;

dotenv.config();

async function start() {
  const app = express();

  const MONGO_DB = process.env.DB_HOST;
  const client = new MongoClient(
    MONGO_DB,
    { useNewUrlParser: true },
  );
  await client.connect();
  const db = client.db();

  const server = createApolloServer({
    typeDefs,
    resolvers,
    context: { db },
  });
  await server.start();
  server.applyMiddleware({ app });

  app.get('/', (req, res) => res.end('Welcome to PhotoShare API'));

  app.listen({ port: 4000 }, () => {
    log(`🚀 GraphQL Server running @ http://localhost:4000${server.graphqlPath}`);
  });
}

start().catch(console.error);
