/* eslint-disable consistent-return,newline-per-chained-call */
const express = require('express');

const router = express.Router();

const { check, validationResult } = require('express-validator/check');
const jwt = require('jsonwebtoken');
const { improvedEnv } = require('../env');

const MESSAGE = require('../services/message');

const UserModel = require('../database/model/user.model');

// checkUsernameMiddleware::(Request, Response, () -> Void) -> Void
const checkUsernameMiddleware = check('username', MESSAGE.USERNAME_DEFAULT_VALIDATE_MSG)
  .isLength({ min: 5 }).withMessage(MESSAGE.USERNAME_TOO_SHORT);

// usernameNotExisting::String -> Promise Error Boolean
const usernameNotExisting = username =>
  UserModel.find({ username })
    .then(result => result.length < 1);

// checkUsernameExistingMiddleware::(Request, Response, () -> Void) -> Void
const checkUsernameExistingMiddleware = check('username')
  .custom(usernameNotExisting).withMessage(MESSAGE.USERNAME_IN_USE);

// checkPasswordMiddleware::(Request, Response, () -> Void) -> Void
const checkPasswordMiddleware = check('password', MESSAGE.PASSWORD_DEFAULT_VALIDATE_MSG)
  .isLength({ min: 5 }).withMessage(MESSAGE.PASSWORD_TOO_SHORT);

// errorHandlingMiddleware::(Request, Response, () -> Void) -> Void
const errorHandlingMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }
  next();
};

const postValidationMiddlewares = [
  checkUsernameMiddleware,
  checkUsernameExistingMiddleware,
  checkPasswordMiddleware,
  errorHandlingMiddleware,
];

const postLogicMiddleware = (req, res) => {
  const { username, password } = req.body;
  UserModel.create({ username, password }).then(() => {
    res.status(201).end();
  });
};

// Register route
router.post('/', postValidationMiddlewares, postLogicMiddleware);

// getUserInfoFromHeader::Request -> {String, String}
const getUserInfoFromHeader = req => ({
  username: req.get('username'),
  password: req.get('password'),
});

const getValidationMiddlewares = [
  checkUsernameMiddleware,
  checkPasswordMiddleware,
  errorHandlingMiddleware,
];

// createToken::{String} -> String
const createToken = payload => jwt.sign(payload, improvedEnv.JWT_SECRET, { noTimestamp: true });

const getLogicMiddleware = (req, res) => {
  const { username, password } = getUserInfoFromHeader(req);
  UserModel.findOne({ username, password }).then(result =>
    (result ? res.send({ token: createToken({ username }) }) : res.status(401).send()));
};

// Login route
router.get('/', getValidationMiddlewares, getLogicMiddleware);

module.exports = router;
