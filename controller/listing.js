const Listing = require("../models/listings.js");
const Booking = require("../models/booking.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const {
  inferListingCategory,
  matchesCategory,
  normalizeCategory,
} = require("../utils/listingCategories");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });

// Check Mapbox token
if (!mapBoxToken) {
  console.error("⚠️ Mapbox Token missing! Check your .env file.");
}
console.log("Mapbox Token:", mapBoxToken);

function addLikeState(listings, user) {
  if (!user) {
    return listings.map((listing) => ({ ...listing.toObject(), isLiked: false }));
  }

  return listings.map((listing) => {
    const isLiked = listing.likes.some((like) => like._id.equals(user._id));
    return { ...listing.toObject(), isLiked };
  });
}

// INDEX CONTROLLER
module.exports.indexListing = async (req, res) => {
  const selectedCategory = normalizeCategory(req.query.category);
  const listingQuery = selectedCategory ? { category: selectedCategory } : {};
  let allListings = await Listing.find(listingQuery).populate("likes").maxTimeMS(30000);

  if (selectedCategory) {
    allListings = allListings.filter((listing) =>
      matchesCategory(listing, selectedCategory)
    );
  }

  allListings = addLikeState(allListings, req.user);
  
  res.render("listings/index.ejs", { allListings, selectedCategory });
};

//  FIXED NEW CONTROLLER
module.exports.NewListing = (req, res) => {
  // Pass bookings (empty array to prevent EJS crash)
  res.render("listings/new.ejs", { bookings: [] });
};

// SHOW CONTROLLER
module.exports.ShowListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner")
    .populate("likes");

  if (!listing) {
    req.flash("error", "Hotel doesn't exist 😕🔍");
    return res.redirect("/listings");
  }

  const isLiked = req.user && listing.likes.some(like => like._id.equals(req.user._id));
  res.render("listings/show.ejs", { listing, isLiked });
};

// CREATE CONTROLLER
module.exports.createListing = async (req, res) => {
  try {
    if (!req.body.listing.location) {
      req.flash("error", "Location is required.");
      return res.redirect("/listings/new");
    }

    const response = await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    }).send();

    const newListing = new Listing(req.body.listing);
    newListing.category = inferListingCategory(req.body.listing);
    newListing.owner = req.user._id;

    // Image Upload
    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    // Map geometry
    if (response.body.features.length > 0) {
      newListing.geometry = response.body.features[0].geometry;
    } else {
      newListing.geometry = { type: "Point", coordinates: [0, 0] };
    }

    await newListing.save();
    req.flash("success", "New Hotel added 🎉");
    res.redirect("/listings");
  } catch (error) {
    console.error("Geocoding error:", error);
    req.flash("error", "Failed to create listing. Try again.");
    res.redirect("/listings");
  }
};

// EDIT CONTROLLER
module.exports.editListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Hotel doesn’t exist 😕🔍");
    return res.redirect("/listings");
  }

  let originalImageurl = listing.image.url.replace("/upload", "/upload/w_256,");
  res.render("listings/edit.ejs", { listing, originalImageurl });
};

// UPDATE CONTROLLER
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const updatedListingData = {
    ...req.body.listing,
    category: inferListingCategory(req.body.listing),
  };
  let listing = await Listing.findByIdAndUpdate(id, updatedListingData);

  if (req.file) {
    listing.image = { url: req.file.path, filename: req.file.filename };
  }

  await listing.save();
  req.flash("success", "Hotel updated successfully 🎉✅");
  res.redirect(`/listings/${id}`);
};

// DELETE CONTROLLER
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Hotel deleted ⚠️🗑️");
  res.redirect("/listings");
};
// 🔍 SEARCH CONTROLLER
module.exports.searchListing = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.redirect("/listings");
  }

  let allListings = await Listing.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } }
    ]
  });

  allListings = addLikeState(allListings, req.user);

  res.render("listings/index", { allListings, searchQuery: q, selectedCategory: null });
};

// BOOKING CONTROLLERS

// Show Booking Form
module.exports.bookListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Hotel not found 😕");
    return res.redirect("/listings");
  }
  res.render("listings/book.ejs", { listing });
};

// Create Booking (store in DB)
module.exports.createBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Hotel not found 😕");
      return res.redirect("/listings");
    }

    const { guestName, guestAge, checkIn, checkOut, guests } = req.body;

    const booking = new Booking({
      listing: id,
      user: req.user._id,
      guestName,
      guestAge,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guests: parseInt(guests),
      paymentMethod: "Card",
    });

    await booking.save();

    req.flash(
      "success",
      `🎉 Booking confirmed for ${guestName} (${guestAge} yrs)!`
    );
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Booking failed. Please try again.");
    res.redirect("/listings");
  }
};

// User’s own bookings
module.exports.userBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate("listing");
  res.render("bookings/userBookings.ejs", { bookings });
};

// Owner’s received bookings
module.exports.ownerBookings = async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id }).select("_id");
  const bookings = await Booking.find({ listing: { $in: listings } }).populate("listing user");
  res.render("bookings/ownerBookings.ejs", { bookings });
};

// Toggle Like
module.exports.toggleLike = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("likes");
  const userId = req.user._id;
  
  const likeIndex = listing.likes.findIndex(like => like._id.equals(userId));
  const wasLiked = likeIndex !== -1;
  
  if (wasLiked) {
    listing.likes.splice(likeIndex, 1);
  } else {
    listing.likes.push(userId);
  }
  
  await listing.save();
  
  res.json({ 
    liked: !wasLiked, 
    count: listing.likes.length 
  });
};

// Delete Booking
module.exports.deleteBooking = async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findById(id);
  if (!booking) {
    req.flash("error", "Booking not found");
    return res.redirect("/bookings");
  }
  if (!booking.user.equals(req.user._id)) {
    req.flash("error", "You are not authorized to delete this booking");
    return res.redirect("/bookings");
  }
  await Booking.findByIdAndDelete(id);
  req.flash("success", "Booking deleted successfully");
  res.redirect("/bookings");
};

