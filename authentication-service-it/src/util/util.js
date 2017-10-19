const R = require('ramda');

const build = amount => R.range(0, amount).map(number => ({
  username: `existingUsername${number}`,
  password: 'existingPassword',
}));

module.exports = {
  build,
};