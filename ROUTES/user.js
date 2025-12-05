const express = require("express");
const router = express.Router();
const User = require("../models/User.js");
const Wrapasync = require("../utils/Wrapasync.js");
const passport = require("passport");
const { savedUrl } = require("../views/middleware.js");
const userController = require("../controller/user.js");


//combine signup route(signup)
router.route("/signup")
.get( userController.renderSignupform)
.post(Wrapasync(userController.signupForm)
);

//combile login route(login)
router.route("/login")
.get( userController.renderLoginform)
.post(savedUrl,passport.authenticate("local", {failureRedirect: "/login",failureFlash: true
  }),
 userController.loginForm
);


// // GET signup form

// router.get("/signup", userController.renderSignupform);

// // POST signup form

// router.post(
//   "/signup",
//   Wrapasync(userController.signupForm)
// );

// // GET login form
// router.get("/login", userController.renderLoginform);

// // POST login
// router.post(
//   "/login",
//   savedUrl,
//   passport.authenticate("local", {
//     failureRedirect: "/login",
//     failureFlash: true
//   }),
//  userController.loginForm
// );

// Logout
router.get("/logout", userController.logoutform);

module.exports = router;
