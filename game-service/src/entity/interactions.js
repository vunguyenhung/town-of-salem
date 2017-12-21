/* eslint-disable max-len */
const Task = require('folktale/concurrency/task');
const R = require('ramda');

/*
3rd Party library imports
 */

/*
Project file imports
 */

// player in vote phase will send interact mutation to lynch a player
// API GW will send INTERACT event to tos-game-events
// {
// 	type: '[Game] INTERACT',
// 	payload: {
// 	  source: 'vunguyenhung', // username
// 		target: 'vunguyenhung2'
//  },
// }
// after vote phase and enter night phase, state of the most voted person will be changed to died

// const interactions = {
// 	dqwdqwcc123: [
// 		{
// 			source: {
// 				username: 'vunguyenhung',
// 				role: 'Jailor',
// 			},
// 			target: {
// 				username: 'vunguyenhung2',
// 				role: 'Mafioso',
// 			},
// 		},
// 		{
// 			source: {
// 				username: 'vunguyenhung3',
// 				role: 'Sheriff',
// 			},
// 			target: {
// 				username: 'vunguyenhung2',
// 				role: 'Mafioso',
// 			},
// 		},
// 		{
// 			source: {
// 				username: 'vunguyenhung5',
// 				role: 'Mafioso',
// 			},
// 			target: {
// 				username: 'vunguyenhung6',
// 				role: 'Doctor',
// 			},
// 		},
// 	],
// };

// DAY action ?
// after each phase, clear game interaction

// for each game ?
// const handleInteraction = ({source, target}) =>
//  waitAll([findPlayerByUsername(source), findPlayerByUsername(target)])
//    .chain(([sourceDoc, targetDoc]) => addToInteractions([sourceDoc, targetDoc]))

// generateNextPhase(currentPhase) -> {phase: 'N1', time: 40}

// const handlePhaseEnded = ({phase, id}) =>
//  updatePhase(id, currentPhase)
//    .chain(() => handleInteractions(currentPhase, id))
// 		.chain(() => findGameById(id))
//    .chain(() =>
//        sendEventToStateUpdateTopic('[Game] GAME_UPDATED', { ...gameDoc.toObject(), ...generateNextPhase(currentPhase)})))
//    .chain(() => sendEventToPhaseTopic('[Phase] PHASE_START', {...generateNextPhase(currentPhase), id})

// handleDayInteractions = (currentPhase, id) =>
//
//
//
//

// TODO: update game State
// TODO: update player State: { died: true, interactionResults: ['asdasd','asdasd'] }

// D1 -> V1 -> N1 -> D2 -> V2 -> N2
// day -> vote -> night -> day -> vote -> ...
// const handleInteractions = (currentPhase, id) => {
//    if(currentPhase == night) // end of vote phase
//      handleVoteInteractions(currentPhase, id)
//    else if(currentPhase == day) // end of night phase
//      handleNightInteractions(currentPhase, id)
//    clearInteractions(id);
// }

// orders:
//  Jailor - 1
//  Framer - 2

// target.status
// sheriff
//  if(isJailed(target))
//		source.lastInteractedResults += 'Your target is jailed'
//  else if (isFramed(target))
//		source.lastInteractedResults += 'Your target is a member of the Mafia'
//  else {
//    switch (target.role){
//    case SK:
//		  source.lastInteractedResults += 'Your target is the SK'
//    case Mafioso:
//    case Farmer:
//		  source.lastInteractedResults += 'Your target is a member of the Mafia'
//    }
//  }

// find targets of maf
// Farmer
//  if(isJailed(target))
//		source.lastInteractedResults += 'Your target is jailed'
//  else {
//    target.status = 'framed'
//  }

// Jailor
//  if(target.role === SK){
//    source.died = true
//  } else {
//		target.status = 'jailed'
//  }
//

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

	append({ gameId, ...interaction }) {
		const gameInteractions = this.interactions[gameId];
		// 	payload: { gameId: '5a3b752d5b6fee0027a44aaf',
		//    source: { username: 'vnhung1', died: false, role: 'Sheriff' },
		//    target: { username: 'vnhung2', died: false, role: 'Doctor' } }

		// if gameId not exist in key of this.interactions
		//    add a sub-array with the key is the gameId
		//    then add an element to that array
		// else get existing gameInteractions
		//    then add an element to that.
		if (gameInteractions) {
			this.interactions[gameId] = updateOrAppend(gameInteractions, interaction);
		} else {
			this.interactions = { ...this.interactions, [gameId]: [interaction] };
		}
		return this.interactions;
	}
}

module.exports = new Interactions();
