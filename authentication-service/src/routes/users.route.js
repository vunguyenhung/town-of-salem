/* eslint-disable consistent-return,newline-per-chained-call */
const express = require('express');

const router = express.Router();
const MESSAGE = require('../services/message');

const UserModel = require('../database/model/user.model');
const { check, validationResult } = require('express-validator/check');

router.get('/', (req, res) => {
  // TODO: return token here
  res.send('user route');
});

const usernameNotExisting = username =>
  UserModel.find({ username }).then(result => result.length < 1);

const errorHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }
  next();
};

const checkUsername = check('username', MESSAGE.USERNAME_DEFAULT_VALIDATE_MSG)
  .isLength({ min: 5 }).withMessage(MESSAGE.USERNAME_TOO_SHORT)
  .custom(usernameNotExisting).withMessage(MESSAGE.USERNAME_IN_USE);

const checkPassword = check('password', MESSAGE.PASSWORD_DEFAULT_VALIDATE_MSG)
  .isLength({ min: 5 }).withMessage(MESSAGE.PASSWORD_TOO_SHORT);

// do validate step
router.post('/', [
  checkUsername,
  checkPassword,
], errorHandler);

// do business logic step.
router.post('/', (req, res) => {
  res.status(201).end();
});

module.exports = router;
