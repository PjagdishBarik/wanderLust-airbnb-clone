const Listing=require("../models/listings");
const Review = require("../models/review");
const { listingSchema,reviewSchema} = require("../schema.js");
const Expresserror=require("../utils/Expresserror.js");

// Middleware: check if user is logged in

module.exports.isLoggedIn=(req,res,next)=>{
      if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
    req.flash("error","You must be signed in first 🔒👤");
    return res.redirect("/login");
  };
  next();
};

// Middleware: store saved URL
module.exports.savedUrl=(req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl;
  };
  next();
};

//owner middleware
module.exports.isOwner=async(req,res,next)=>{
    let { id } = req.params;
    let listing = await Listing.findById(id);
if(!listing.owner.equals(res.locals.currentUser._id)){
  req.flash("error","You are not authorized to do that 🔒🚫");
  return res.redirect(`/listings/${id}`);
}
next();
};

// Middleware: validate listing
module.exports.validatelistings = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new Expresserror(400, errmsg);
  } else {
    next();
  }
};

// Middleware: validate review

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new Expresserror(400, errMsg);
    } else {
        next();
    }
};
// check if user is review 

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currentUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};