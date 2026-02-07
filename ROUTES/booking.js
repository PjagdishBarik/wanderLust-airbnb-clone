const express = require("express");
const router = express.Router();
const { userBookings, ownerBookings, deleteBooking } = require("../controller/listing.js");
const { isLoggedIn } = require("../views/middleware.js");

// Route for user's own bookings
router.get("/", isLoggedIn, userBookings);

// Route for owner's received bookings (if needed, but not linked in navbar)
router.get("/owner", isLoggedIn, ownerBookings);

// Delete booking
router.delete("/:id", isLoggedIn, deleteBooking);

module.exports = router;
