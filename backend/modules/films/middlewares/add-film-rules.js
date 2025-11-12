const { body, query } = require("express-validator");
const checkValidation = require("../../../shared/middlewares/check-validation");

const addFilmRules = [
  body("title")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 1 })
    .withMessage("Title must be at least 1 characters long")
    .notEmpty()
    .withMessage("Title is required"),

  body("genre")
    .isString()
    .withMessage("Genre must be a string")
    .isLength({ min: 6})
    .notEmpty()
    .withMessage("Genre is required."),

  body("release_date")
    .isDate({ format: "DD-MM-YYYY"})
    .withMessage('Please enter a valid date, using the "DD-MM-YYYY" format.')
    .notEmpty()
    .withMessage("Release date is required."),

  body("rating")
    .optional()
    .isFloat({ gt: 0.0 })
    .withMessage("Rating must be a positive number.")
    .isFloat({ lt: 10.1 })
    .withMessage("Rating must be less than or equal to 10."),

  checkValidation,
];

module.exports = addFilmRules;