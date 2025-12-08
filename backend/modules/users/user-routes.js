const { Router } = require("express");
const registerRules = require("./middlewares/user-registration-rules");
const loginRules = require("./middlewares/user-login-rules");

const UserModel = require("./user-model");
const { matchPassword } = require("../../shared/password-utils");
const { encodeToken } = require("../../shared/jwt-utils");
const authorize = require("../../shared/middlewares/authorize");
const verifyLoginRules = require("./middlewares/verify-login-rules");
const { randomNumberOfNDigits } = require("../../shared/compute-utils.js")
const OTPModel = require("./otp-model.js")
const sendEmail = require("../../shared/send-utils.js")

const usersRoute = Router();

/**
 * Login Route
 */
usersRoute.post("/login", loginRules, async (req, res) => {
  const { email, password } = req.body;
  const foundUser = await UserModel.findOne({ email });
  if (!foundUser) {
    return res.status(404).json({
      errorMessage: `User with ${email} doesn't exist`,
    });
  }
  const passwordMatched = matchPassword(password, foundUser.password);
  if (!passwordMatched) {
    return res.status(401).json({
      errorMessage: `Email and password didn't matched`,
    });
  }
  const otpCode = randomNumberOfNDigits(6)
  console.log("OTP:", otpCode)
  await OTPModel.findOneAndUpdate(
    {account: foundUser._id},
    {otp: otpCode},
    {upsert: true, new: true}
  )
  await sendEmail(
    email,
    "Your Login OTP",
    `Your OTP code is: ${otpCode}. This code will expire in 5 minutes.`
  )
  res.json("OTP has been sent to email. Please use it for verification.");
});

/**
 * Verify Login Route
 */
usersRoute.post(
  "/verify-login",
  verifyLoginRules,
  async (req, res) => {
    try {
      const {email, otp} = req.body
      const foundUser = await UserModel.findOne({email})
      if (!foundUser) {
        return res.status(404).json({error_message: "Error: Email does not exist"})
      }
      const savedOTP = await OTPModel.findOne({account: foundUser._id})
      if (!savedOTP) {
        return res.status(400).json({error_message: "Error: Cannot find OTP. Please generate a new one."})
      }
      if (savedOTP.otp !== Number(otp)) {
        return res.status(400).json({error_message: "Error: OTP entered invalid. Cannot verify user."})
      }
      const user = {...foundUser.toJSON(), password: undefined}
      const token = encodeToken(user)
      res.json({
        message: "OTP verification successful.",
        user,
        token
      })
    } catch (err) {
      res.status(500).send("Error occurred during verification", err.message)
    }
  }
);

/**
 * Register Route
 */
usersRoute.post("/register", registerRules, async (req, res) => {
  const newUser = req.body;
  const existingUser = await UserModel.findOne({
    email: newUser.email,
  });
  if (existingUser) {
    return res.status(500).json({
      errorMessage: `User with ${newUser.email} already exist`,
    });
  }
  const addedUser = await UserModel.create(newUser);
  if (!addedUser) {
    return res.status(500).json({
      errorMessage: `Oops! User couldn't be added!`,
    });
  }
  const user = { ...addedUser.toJSON(), password: undefined };
  res.json(user);
});

/**
 * Get all users Route
 */
usersRoute.get("/", authorize(["admin"]), async (req, res) => {
  const allUsers = await UserModel.find().select("-password");
  if (!allUsers) res.send([]);
  res.json(allUsers);
});

/**
 * Get user by id Route
 */
usersRoute.get(
  "/:id",
  authorize(["admin", "client"]),
  async (req, res) => {
    const userID = req.params.id;
    const isAdmin = req.user.roles.includes("admin");
    // TODO: If not admin, don't allow to access others account
    if (!isAdmin) {
      const currentUserID = req.user._id.toString()
      if (currentUserID !== userID) {
        return res.status(403).send("Error: Access denied. User can only access own profile.")
      }
    }
    const foundUser = await UserModel.findById(userID);
    if (!foundUser) {
      return res
        .status(404)
        .send({ errorMessage: `User with ${userID} doesn't exist` });
    }
    res.json(foundUser);
  }
);

/**
 * Update user Route
 */
usersRoute.put("/:id", authorize(["admin", "client"]), async (req, res) => {
  const userID = req.params.id;
  // TODO: If not admin, don't allow to update others account
  const isAdmin = req.user.roles.includes("admin")
  if (!isAdmin) {
    const currentUserID = req.user._id.toString()
    if (currentUserID !== userID) {
      return res.status(403).send("Error: Access denied. User can only update own account.")
    }
  }
  const newUser = req.body;
  if (!newUser) {
    return res.status(421).json({ errorMessage: "Nothing to update" });
  }
  // Only allow admin to change the roles
  if (!isAdmin && newUser.roles) {
    return res.status(401).json({
      errorMessage:
        "You don't have permission to update your role. Please contact the support team for the assistance!",
    });
  }
  const foundUser = await UserModel.findById(userID);
  if (!foundUser) {
    return res
      .status(404)
      .send({ errorMessage: `User with ${userID} doesn't exist` });
  }
  const updatedUser = await UserModel.findByIdAndUpdate(
    userID,
    {
      $set: newUser,
    },
    { new: true }
  ).select("-password");

  if (!updatedUser) {
    return res
      .status(500)
      .send({ errorMessage: `Oops! User couldn't be updated!` });
  }
  res.json(updatedUser);
});

/**
 * Delete user Route
 */
usersRoute.delete("/:id", authorize(["admin"]), async (req, res) => {
  const userID = req.params.id;
  const foundUser = await UserModel.findById(userID);
  if (!foundUser) {
    return res
      .status(404)
      .send({ errorMessage: `User with ${userID} doesn't exist` });
  }
  const deletedUser = await UserModel.findByIdAndDelete(userID).select(
    "-password"
  );
  if (!deletedUser) {
    return res
      .status(500)
      .send({ errorMessage: `Oops! User couldn't be deleted!` });
  }
  res.json(deletedUser);
});

module.exports = { usersRoute };