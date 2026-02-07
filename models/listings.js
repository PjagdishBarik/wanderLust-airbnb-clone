const mongoose = require("mongoose");
const review = require("./review");
const { ref } = require("joi");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,
  
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "review"
    }
  ],
  owner:{
   type: Schema.Types.ObjectId,
   ref:"User",
  }
  ,
  geometry:{
     type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
});

listingSchema.post("findOneAndDelete",async(Listing)=>{
  if(Listing){
  await review.deleteMany({_id:{$in:Listing.reviews}})
  }

})
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
