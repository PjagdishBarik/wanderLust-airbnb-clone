const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listings.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Wrapasync=require("./utils/Wrapasync.js");
const Expresserror=require("./utils/Expresserror.js");
const { listingSchema,reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");





const { data: sampleListings } = require("./init/data.js");
const expressError = require("./utils/Expresserror.js");
const { PassThrough } = require("stream");
const review = require("./models/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));








app.get("/", (req, res) => {
  res.send("Hi, I am root");
});
const validatelistings = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new Expresserror(400, errmsg);
  } else {
    next();
  }
}

const validatereview= (req, res, next) => {
  console.log("Request body in validatereview middleware:", req.body);
  console.log("Review data in validatereview middleware:", req.body ? req.body.review : undefined);
  if (!req.body || !req.body.review) {
    throw new Expresserror(400, "Review data is missing in the request body");
  }
  const { error } = reviewSchema.validate(req.body.review);
  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new Expresserror(400, errmsg);
  } else {
    next();
  }
}

//Index Route
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

// Sample Listings Route
app.get("/sample-listings", (req, res) => {
  res.render("listings/index.ejs", { allListings: sampleListings });
});

//New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", Wrapasync (async (req, res) => {
  
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  res.render("listings/show.ejs", { listing });
}));

//Create Route
app.post("/listings", validatelistings, Wrapasync(async (req, res, next) => {
  try {
    const result = await listingSchema.validateAsync(req.body);
    if (!req.body.listing) {
      throw new Expresserror(400, "Invalid listing data");
    }
    // Transform image field if it is an object
    if (req.body.listing.image && typeof req.body.listing.image === 'object' && req.body.listing.image.url) {
      req.body.listing.image = req.body.listing.image.url;
    }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  } catch (err) {
    throw new Expresserror(400, err.message);
  }
}));

//Edit Route
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

//Update Route
app.put("/listings/:id", validatelistings, Wrapasync(async (req, res) => {
  let { id } = req.params;
  // Transform image field if it is an object
  if (req.body.listing.image && typeof req.body.listing.image === 'object' && req.body.listing.image.url) {
    req.body.listing.image = req.body.listing.image.url;
  }
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});

//review
//post route


app.post("/listings/:id/review",validatereview, Wrapasync(async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  listing.reviews.push(newReview._id);

  await newReview.save();
  await listing.save();

res.redirect(`/listings/${listing._id}`);
}));

//Delete  review route


app.delete("/listings/:id/reviews/:reviewId", Wrapasync(async (req, res) => {
  let { id, reviewId } = req.params;
  
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${id}`);
}));

app.all("*",(req,res,next)=>{
  next(new Expresserror(404,"page not found!"))
});


app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", {message});
});

app.listen(8080, () => {
  console.log("server is listening to port 8085");
});