const { body } = require("express-validator");
const checkValidation = require("../../../shared/middlewares/check-validation");

const updateWatchlistRules = [
  body("name")
    .optional()
    .isString()
    .withMessage("Watchlist name must be a string.")
    .isLength({ min: 1, max: 100 })
    .withMessage("Watchlist name must be between 1 and 100 characters.")
    .trim(),

  body("isPublic")
    .optional()
    .isBoolean()
    .withMessage("isPublic must be a boolean value."),

  checkValidation,
];

module.exports = updateWatchlistRules;