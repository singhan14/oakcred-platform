const { auth } = require('express-oauth2-jwt-bearer');

const auth0Config = {
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  tokenSigningAlg: 'RS256'
};

// Middleware to protect routes with Auth0
const checkJwt = auth(auth0Config);

module.exports = { checkJwt, auth0Config };
