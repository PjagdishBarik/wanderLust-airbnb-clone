// const Review = require("../models/review.js");
// const Listing = require("../models/listings.js");




// module.exports.createReview = async (req, res) => {
//   let listing = await Listing.findById(req.params.id);

//   let newReview = new Review(req.body.review);
//   newReview.author = req.user._id;


//   console.log(newReview);
//   // listing.reviews.push(newReview);
//   listing.reviews.push(newReview._id);


//   await newReview.save();
//   await listing.save();
//  req.flash("success","New reviews are added ✨");
//   res.redirect(`/listings/${listing._id}`);
// };



// // DELETE: remove review controller
// module.exports.destroyReview = async (req, res) => {
//   let { id, reviewId } = req.params;

//   await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
//   await Review.findByIdAndDelete(reviewId);
//  req.flash("success"," Reviews are deleted ⚠️🗑️");
//   res.redirect(`/listings/${id}`);
// };
const Review = require("../models/review.js");
const Listing = require("../models/listings.js");

module.exports.createReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);

  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;

  console.log("Incoming review:", newReview);

  // THE ONLY FIX
  listing.reviews.push(newReview._id);

  await newReview.save();
  await listing.save();

  req.flash("success", "New review added ✨");
  res.redirect(`/listings/${listing._id}`);
};

// DELETE: remove review
module.exports.destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review deleted ⚠️🗑️");
  res.redirect(`/listings/${id}`);
};
