const joi=require("joi");
const review = require("./models/review");
const { LISTING_CATEGORIES } = require("./utils/listingCategories");

module.exports.listingSchema=joi.object({
    listing: joi.object({

    title:joi.string().required(),
   description:joi.string().required(),
   location:joi.string().required(),
   country:joi.string().required(),
   price:joi.number().required().min(0),
   category:joi.string().valid(...LISTING_CATEGORIES).optional(),
    image:joi.string().allow("",null)
}).required()
});
module.exports.reviewSchema = joi.object({
  review: joi.object({
    rating: joi.number().required().min(1).max(5),
    comment: joi.string().required()
  }).required()
});
