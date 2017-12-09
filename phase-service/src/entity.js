/*
3rd Party library imports
 */
const { of } = require('folktale/concurrency/task');

/*
Project file imports
 */

const startGame = id => of(id);

module.exports = {
	startGame,
};

