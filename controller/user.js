const User = require("../models/User.js");

// GET signup form
module.exports.renderSignupform = (req, res) => {
  res.render("users/signup");
};

// POST signup form
module.exports.signupForm =async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const newUser = new User({ username, email });
      const registeredUser = await User.register(newUser, password);

      req.login(registeredUser, err => {
        if (err) return next(err);
        req.flash("success", "Welcome to Wanderlust!");
        res.redirect("/listings");
      });
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/signup");
    }
  };
  //get login form
  module.exports.renderLoginform = (req, res) => {
  res.render("users/login.ejs")
};

  //post login form
  module.exports.loginForm = async(req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  };
  //logout
  module.exports.logoutform=(req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash("success", "Logged you out!");
    res.redirect("/listings");
    });
};