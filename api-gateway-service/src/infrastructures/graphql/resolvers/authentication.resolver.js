/*
3rd Party library imports
 */
const jwt = require('jsonwebtoken');

/*
Project file imports
 */
const { baseResolver } = require('./base.resolver');

const authenticationResolver = baseResolver.createResolver((root, { token }, ctx) => {
  const decoded = jwt.decode(token);
  ctx.username = decoded.username;
});

module.exports = {
  authenticationResolver,
};
