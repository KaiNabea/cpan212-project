const { body } = require("express-validator");
const checkValidation = require("../../../shared/middlewares/check-validation");

const updateFilmRules = [
  body("title")
    .optional()
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 1 })
    .withMessage("Title must be at least 3 characters long"),

  body("genre")
    .isString()
    .withMessage("Genre must be a string")
    .isLength({ min: 6})
    .withMessage("Genre must be 6 characters long.")
    .notEmpty()
    .withMessage("Genre is required"),

  body("release_date")
    .isDate({ format: "DD-MM-YYYY" })
    .withMessage('Enter a valid date, with the format "DD-MM-YYYY".')
    .notEmpty()
    .withMessage("Date is required."),

  body("rating")
    .optional()
    .isFloat({ gt: 0.0 })
    .withMessage("Rating must be a positive number.")
    .isFloat({ lt: 10.1 })
    .withMessage("Rating must be less than or equal to 10.0"),

  checkValidation,
];

module.exports = updateFilmRules;
