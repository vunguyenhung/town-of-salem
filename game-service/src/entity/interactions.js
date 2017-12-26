/* eslint-disable max-len */
const R = require('ramda');

const updateOrAppend = R.curry((source, subject) => {
	const index = R.findIndex(R.eqProps('source', subject))(source);
	return R.equals(index, -1)
		? R.append(subject)(source)
		: R.update(index, subject)(source);
});

class Interactions {
	constructor() {
		this.interactions = {};
	}

	// const interactions = {
	// 	'asdasdsad': [
	// 		{
	// 			source: {...},
	// 			target: {...},
	// 		}
	// 	]
	// };

	instance() {
		return this.interactions;
	}

	get(gameId) {
		return this.interactions[gameId] || [];
	}

	append({ gameId, ...interaction }) {
		const gameInteractions = this.interactions[gameId];
		// 	payload: { gameId: '5a3b752d5b6fee0027a44aaf',
		//    source: { username: 'vnhung1', died: false, role: 'Sheriff' },
		//    target: { username: 'vnhung2', died: false, role: 'Doctor' } }
		if (gameInteractions) {
			this.interactions[gameId] = updateOrAppend(gameInteractions, interaction);
		} else {
			this.interactions = { ...this.interactions, [gameId]: [interaction] };
		}
		return this.interactions;
	}

	clear() {
		this.interactions = R.mapObjIndexed(() => [], this.interactions);
	}
}

module.exports = new Interactions();
