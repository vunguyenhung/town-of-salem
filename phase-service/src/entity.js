/*
3rd Party library imports
 */
const { task } = require('folktale/concurrency/task');

/*
Project file imports
 */
const { sendEventToGameTopic } = require('./utils');

// when game-service send an event:

// {
// 	type: '[Game] START_PHASE',
// 	payload: {
// 		nextPhase: 'D1',
//    time: 40, //s
// 		id: 'qwdqwd',
// 	},
// };

// If the event is PHASE_PROCESSED, phase-service will create an Observable/Task to countdown time,
// when the time comes, it will send PHASE_UPDATED message to game-service

// PHASE_UPDATED = {
// 	type: '[Game] PHASE_ENDED',
// 	payload: {
// 		currentPhase: 'D1',
// 		id: 'qwdqwd',
// 	},
// };

// const a = { type: '[Phase] START_PHASE', payload: { nextPhase: 'D1', time: 5, id: '123' } };

const delay = second => task((resolver) => {
	const ms = second * 1000;
	const timerId = setTimeout(() => resolver.resolve(ms), ms);
	resolver.cleanup(() => {
		clearTimeout(timerId);
	});
});

const startPhase = ({ phase, time, id }) =>
	delay(time).chain(() => sendEventToGameTopic('[Game] PHASE_ENDED', { phase, id }));

module.exports = {
	startPhase,
};

