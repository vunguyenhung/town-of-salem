/* eslint-disable consistent-return,newline-per-chained-call */
const express = require('express');

const router = express.Router();
const MESSAGE = require('../services/message');

const UserModel = require('../database/model/user.model');
const { check, validationResult } = require('express-validator/check');

// usernameNotExisting::String -> Promise Error Boolean
const usernameNotExisting = username =>
  UserModel.find({ username })
    .then(result => result.length < 1);

// checkUsernameMiddleware::(Request, Response, Void) -> Void
const checkUsernameMiddleware = check('username', MESSAGE.USERNAME_DEFAULT_VALIDATE_MSG)
  .isLength({ min: 5 }).withMessage(MESSAGE.USERNAME_TOO_SHORT);

// checkUsernameExistingMiddleware::(Request, Response, Void) -> Void
const checkUsernameExistingMiddleware = check('username')
  .custom(usernameNotExisting).withMessage(MESSAGE.USERNAME_IN_USE);

// checkPasswordMiddleware::(Request, Response, Void) -> Void
const checkPasswordMiddleware = check('password', MESSAGE.PASSWORD_DEFAULT_VALIDATE_MSG)
  .isLength({ min: 5 }).withMessage(MESSAGE.PASSWORD_TOO_SHORT);

// errorHandlingMiddleware::(Request, Response, Void) -> Void
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
  const getUserInfo = ({ username, password }) => ({ username, password });

  UserModel.create(getUserInfo(req.body))
    .then(() => {
      res.status(201).end();
    });
};

// do business logic step.
router.post('/', postValidationMiddlewares, postLogicMiddleware);

// login is get
router.get('/', (req, res) => {
  // TODO: return token here
  res.send('user route');
});

module.exports = router;
