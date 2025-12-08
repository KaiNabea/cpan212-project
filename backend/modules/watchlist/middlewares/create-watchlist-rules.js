const { body } = require("express-validator");
const checkValidation = require("../../../shared/middlewares/check-validation");

const createWatchlistRules = [
  body("name")
    .notEmpty()
    .withMessage("Watchlist name is required.")
    .isString()
    .withMessage("Watchlist name must be a string.")
    .isLength({ min: 1, max: 100 })
    .withMessage("Watchlist name must be between 1 and 100 characters.")
    .trim(),

  body("isPublic")
    .optional()
    .isBoolean()
    .withMessage("isPublic must be a boolean value."),

  body("films")
    .optional()
    .isArray()
    .withMessage("Films must be an array.")
    .custom((films) => {
      if (films.length > 0) {
        const allValid = films.every(filmId => {
          return typeof filmId === 'string' && filmId.match(/^[0-9a-fA-F]{24}$/);
        });
        if (!allValid) {
          throw new Error("All film IDs must be valid MongoDB ObjectIds.");
        }
      }
      return true;
    }),

  checkValidation,
];

module.exports = createWatchlistRules;