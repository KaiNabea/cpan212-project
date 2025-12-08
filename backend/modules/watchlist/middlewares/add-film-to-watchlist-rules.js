const { body } = require("express-validator");
const checkValidation = require("../../../shared/middlewares/check-validation");

const addFilmToWatchlistRules = [
  body("filmId")
    .notEmpty()
    .withMessage("Film ID is required.")
    .isMongoId()
    .withMessage("Invalid Film ID format."),

  checkValidation,
];

module.exports = addFilmToWatchlistRules;