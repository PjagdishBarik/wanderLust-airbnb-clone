const express = require("express");
const router = express.Router({mergeParams:true});
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listings.js"); 
const Wrapasync = require("../utils/Wrapasync.js");
const Expresserror = require("../utils/Expresserror.js");
const {validateReview, isLoggedIn, isReviewAuthor } = require("../views/middleware.js");
const reviewsController = require("../controller/reviews.js");

// POST: create review
router.post("/",
  validateReview,
  isLoggedIn,
   Wrapasync(reviewsController.createReview)
  );

// DELETE: remove review
router.delete("/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  Wrapasync(reviewsController.destroyReview)
);


module.exports = router;
