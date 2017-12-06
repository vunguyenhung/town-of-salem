/* eslint-disable no-param-reassign */
/*
3rd Party library imports
 */
const express = require('express');

const router = express.Router();

/*
Project file imports
 */
const { getGameByUsername } = require('../entity');

router.get('/', (req, res) => {
	const username = req.get('username');
	getGameByUsername(username).then((result) => {
		if (result) {
			return res.status(200).json(result.toObject({
				transform: (doc, ret) => {
					ret.id = ret._id;
					// TODO: hide the role here if present
					return ret;
				},
			}));
		}
		return res.status(404).end();
	});
});

module.exports = router;

