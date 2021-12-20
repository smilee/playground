import fetch from 'node-fetch';

import { authorizeWithGithub } from '../api'

let id = 0;

export default {
  fakeUserAuth: async (parent, { githubLogin }, { db }) => {
    const user = await db.collection('users').findOne({ githubLogin });

    if (!user) {
      throw new Error(`Cannot find user with githubLogin "${githubLogin}"`);
    }

    return {
      token: user.githubToken,
      user,
    }
  },
  addFakeUsers: async (root, { count }, { db }) => {
    const randomUserApi = `http://randomuser.me/api/?results=${count}`;

    const { results } = await fetch(randomUserApi).then(res => res.json());

    const users = results.map(result => ({
      githubLogin: result.login.username,
      name: `${result.name.first} ${result.name.last}`,
      avatar: result.picture.thumbnail,
      githubToken: result.login.sha1,
    }));

    await db.collection('users').insertMany(users);

    return users;
  },
  postPhoto: async (parent, args, { db, currentUser }) => {
    if (!currentUser) {
      throw new Error('only an authorized user can post a photo');
    }

    const newPhoto = {
      ...args.input,
      userID: currentUser.githubLogin,
      created: new Date(),
    };

    const { insertedId } = await db.collection('photos').insertOne(newPhoto);

    newPhoto.id = insertedId;

    return newPhoto;
  },
  githubAuth: async (parent, { code }, { db }) => {
    let {
      message,
      access_token,
      avatar_url,
      login,
      name,
    } = await authorizeWithGithub({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code,
    });

    if (message) {
      throw new Error(message);
    }

    let latestUserInfo = {
      name,
      githubLogin: login,
      githubToken: access_token,
      avatar: avatar_url,
    };

    const { value: user } = await db
      .collection('users')
      .findOneAndReplace({ githubLogin: login }, latestUserInfo, { upsert: true, returnNewDocument: true });
    
    return { user, token: access_token };
  }
};
