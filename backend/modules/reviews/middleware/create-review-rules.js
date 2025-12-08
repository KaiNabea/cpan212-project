const { body } = require("express-validator");
const checkValidation = require("../../../shared/middlewares/check-validation");

const addReviewRules = [
  body("film")
    .notEmpty()
    .withMessage("Film ID is required")
    .isMongoId()
    .withMessage("Invalid Film ID format."),

  body("rating")
    .isFloat({gt: 0.0})
    .withMessage("Rating must be a number greater than 0.")
    .isFloat({lt: 10.1})
    .withMessage("Rating must be a number less than 10.")
    .notEmpty()
    .withMessage("Rating is required."),

  body("review")
    .isString()
    .withMessage('Review must be a string.')
    .isLength({max: 500})
    .withMessage("Review must be less than 500 characters.")
    .notEmpty()
    .withMessage("Review is required."),

  checkValidation,
];

module.exports = addReviewRules;