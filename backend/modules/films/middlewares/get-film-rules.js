const { query } = require("express-validator");
const checkValidation = require("../../../shared/middlewares/check-validation");

const getFilmRules = [
  query("search")
    .optional()
    .isString()
    .withMessage("Title must be a string"),

  checkValidation,
];

module.exports = getFilmRules;
