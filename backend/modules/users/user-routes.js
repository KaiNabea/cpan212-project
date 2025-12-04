const { Router } = require("express");
const registerRules = require("./middlewares/user-registration-rules");
const loginRules = require("./middlewares/user-login-rules");

const UserModel = require("./user-model");
const { matchPassword } = require("../../shared/password-utils");
const { encodeToken } = require("../../shared/jwt-utils");
const authorize = require("../../shared/middlewares/authorize");

const usersRoute = Router();

usersRoute.get("/:id", authorize, async (req, res) => {
  const lang = req.cookies.lang || "EN";
  const userID = req.params.id;
  if (userID !== req.user._id) {
    return res.status(401).json({
      errorMessage:
        lang === "FR"
          ? "Vous n'êtes pas autorisé à accéder à cette ressource."
          : "You don't have permission to access this resource",
    });
  }
  const foundUser = await UserModel.findById(userID);
  if (!foundUser) {
    return res.status(404).json({
      errorMessage:
        lang === "FR"
          ? "L'utilisateur avec ${userID} n'existe pas."
          : `User with ${userID} doesn't exist`,
    });
  }
  res.json(foundUser);
});

usersRoute.post("/login", loginRules, async (req, res) => {
  const lang = req.cookies.lang || "EN";
  const { email, password } = req.body;
  const foundUser = await UserModel.findOne({ email });
  if (!foundUser) {
    return res.status(404).send({
      errorMessage:
        lang === "FR"
          ? `L'utilisateur associé à l'adresse e-mail ${email} n'existe pas.`
          : `User with ${email} doesn't exist`,
    });
  }
  const passwordMatched = matchPassword(password, foundUser.password);
  if (!passwordMatched) {
    return res.status(401).send({
      errorMessage:
        lang === "FR"
          ? "L'adresse e-mail et le mot de passe ne correspondent pas."
          : `Email and password didn't matched`,
    });
  }
  const user = { ...foundUser.toJSON(), password: undefined };
  // generate access token
  const token = encodeToken(user);
  res.json({ user, token });
});

usersRoute.post("/register", registerRules, async (req, res) => {
  const lang = req.cookies.lang || "EN";
  const newUser = req.body;
  const existingUser = await UserModel.findOne({
    email: newUser.email,
  });
  if (existingUser) {
    return res.status(500).json({
      errorMessage:
        lang === "FR"
          ? `L'utilisateur avec ${newUser.email} existe déjà.`
          : `User with ${newUser.email} already exist`,
    });
  }
  const addedUser = await UserModel.create(newUser);
  if (!addedUser) {
    return res.status(500).send({
      errorMessage:
        lang === "FR"
          ? `Oups ! Impossible d'ajouter l'utilisateur !`
          : `Oops! User couldn't be added!`,
    });
  }
  const user = { ...addedUser.toJSON(), password: undefined };
  res.json(user);
});

module.exports = { usersRoute };