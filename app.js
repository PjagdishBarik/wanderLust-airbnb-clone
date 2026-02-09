if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Expresserror = require("./utils/Expresserror.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/User.js");

const listingsRoutes = require("./ROUTES/Listing.js");
const reviewsRoutes = require("./ROUTES/Reviews.js");
const userRoutes = require("./ROUTES/user.js");

/* 🔴🔴🔴 ADD THIS LINE (POINT 1) 🔴🔴🔴 */
const bookingRoutes = require("./ROUTES/booking.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dburl = "mongodb://127.0.0.1:27017/wanderlust";

// Database Connection
async function main() {
  await mongoose.connect(dburl, {
    serverSelectionTimeoutMS: 30000,
  });
}

main()
  .then(() => {
    console.log("Connected to Cloud Database 🧠");

    const PORT = process.env.PORT || 8085;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Database connection error ❌");
    console.log(err);
  });

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionOptions = {
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

passport.use(new LocalStrategy(User.authenticate()));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

app.use("/listings", listingsRoutes);
app.use("/listings/:id/reviews", reviewsRoutes);
app.use("/", userRoutes);
app.use("/bookings", bookingRoutes);

app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});
// if (process.env.NODE_ENV !== "production") {
//   require("dotenv").config();
// }

// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const path = require("path");
// const methodOverride = require("method-override");
// const ejsMate = require("ejs-mate");
// const ExpressError = require("./utils/Expresserror.js");

// const session = require("express-session");
// const flash = require("connect-flash");

// const passport = require("passport");
// const LocalStrategy = require("passport-local");
// const User = require("./models/User.js");

// /* Routes */
// const listingsRoutes = require("./ROUTES/Listing.js");
// const reviewsRoutes = require("./ROUTES/Reviews.js");
// const userRoutes = require("./ROUTES/user.js");
// const bookingRoutes = require("./ROUTES/booking.js");

// /* ===================== DATABASE ===================== */

// const dbUrl = process.env.MONGO_URI;

// if (!dbUrl) {
//   console.error("❌ FATAL ERROR: MONGO_URI is not defined");
//   process.exit(1);
// }


// async function main() {
//   await mongoose.connect(dbUrl);
// }

// main()
//   .then(() => {
//     console.log(" Connected to Cloud Database🧠");

//     const PORT = process.env.PORT || 8080;
//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("❌ Database connection error");
//     console.error(err);
//   });

// /* ===================== APP CONFIG ===================== */

// app.engine("ejs", ejsMate);
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(methodOverride("_method"));
// app.use(express.static(path.join(__dirname, "public")));

// /* ===================== SESSION ===================== */

// const sessionOptions = {
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: true,
//   cookie: {
//     httpOnly: true,
//     expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//   },
// };

// app.use(session(sessionOptions));
// app.use(flash());

// /* ===================== PASSPORT ===================== */

// app.use(passport.initialize());
// app.use(passport.session());

// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// /* ===================== LOCALS ===================== */

// app.use((req, res, next) => {
//   res.locals.success = req.flash("success");
//   res.locals.error = req.flash("error");
//   res.locals.currentUser = req.user;
//   next();
// });

// /* ===================== ROUTES ===================== */

// app.use("/listings", listingsRoutes);
// app.use("/listings/:id/reviews", reviewsRoutes);
// app.use("/bookings", bookingRoutes);
// app.use("/", userRoutes);

// app.get("/", (req, res) => {
//   res.redirect("/listings");
// });

// /* ===================== ERROR HANDLER ===================== */

// app.use((err, req, res, next) => {
//   const { statusCode = 500, message = "Something went wrong!" } = err;
//   res.status(statusCode).render("error.ejs", { message });
// });

