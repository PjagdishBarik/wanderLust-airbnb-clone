// server.js
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");

//  Import route files (make sure these exist)
const userRoutes = require("./routes/user.js");
const postRoutes = require("./routes/post.js");

//  View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//  Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));

//  Session Configuration
const sessionOptions = {
  secret: "mysupersecretstring", // You can use process.env.SECRET in real apps
  resave: false,
  saveUninitialized: true,
};
app.use(session(sessionOptions));

//  Flash Middleware Setup
app.use(flash());

//  Global Middleware — makes flash messages & user data available in all views
app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  res.locals.currentUser = req.session.user || null; // optional if you plan login later
  next();
});

//  Test Routes for Session & Flash
app.get("/register", (req, res) => {
  let { name = "anonymous" } = req.query;
  req.session.name = name;

  if (name === "anonymous") {
    req.flash("error", "User not registered!");
  } else {
    req.flash("success", `Welcome ${name}, you registered successfully!`);
  }

  res.redirect("/hello");
});

app.get("/hello", (req, res) => {
  res.render("Page.ejs", { name: req.session.name });
});

//  Main Routes
app.use("/user", userRoutes);
app.use("/post", postRoutes);

//  Root Route
app.get("/", (req, res) => {
  res.send("🏨 Welcome to Wanderlust Booking System!");
});

//  Start Server
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
