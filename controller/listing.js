const Listing = require("../models/listings.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });

// Check Mapbox token
if (!mapBoxToken) {
  console.error("⚠️ Mapbox Token missing! Check your .env file.");
}
console.log("Mapbox Token:", mapBoxToken);

// INDEX CONTROLLER
module.exports.indexListing = async (req, res) => {
  const allListings = await Listing.find({}).maxTimeMS(30000);
  res.render("listings/index.ejs", { allListings });
};

// ✅ FIXED NEW CONTROLLER
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
    .populate("owner");

  if (!listing) {
    req.flash("error", "Hotel doesn’t exist 😕🔍");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
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
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

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

    const { guestName, guestAge, checkIn, checkOut, guests, paymentMethod } = req.body;

    const booking = new Booking({
      listing: id,
      user: req.user._id,
      guestName,
      guestAge,
      checkIn,
      checkOut,
      guests,
      paymentMethod,
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
