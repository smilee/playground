import fetch from 'node-fetch';

const toJSON = (response) => response.json();
const throwError = (error) => {
  throw new Error(JSON.stringify(error));
}
const requestGithubToken = credentials =>
  fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(credentials)
  })
    .then(toJSON)
    .catch(throwError);
const requestGithubUserAccount = token =>
  fetch(`https://api.github.com/user`, {
    method: 'GET',
    headers: {
      'Authorization': `token ${token}`
    },
  })
    .then(toJSON)
    .catch(throwError);

export const authorizeWithGithub = async (credentials) => {
  const { access_token } = await requestGithubToken(credentials);
  const githubUser = await requestGithubUserAccount(access_token);
  
  return { ...githubUser, access_token };
}