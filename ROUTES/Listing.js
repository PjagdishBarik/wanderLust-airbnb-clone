// const express = require("express");
// const router = express.Router();
// const Wrapasync = require("../utils/Wrapasync.js");
// const { isLoggedIn, isOwner, validatelistings } = require("../views/middleware.js");
// const listingController = require("../controller/listing.js");
// const multer = require("multer");
// const { storage } = require("../cloudConfig.js");
// const upload = multer({ storage });

// // INDEX + CREATE routes
// router.route("/")
//   .get(Wrapasync(listingController.indexListing))
//   .post(
//     isLoggedIn,
//     upload.single("listing[image]"),
//     validatelistings,
//     Wrapasync(listingController.createListing)
//   );

// // NEW route
// router.get("/new", 
//   isLoggedIn, 
//   listingController.NewListing);

// // SHOW + UPDATE + DELETE routes
// router.route("/:id")
//   .get(Wrapasync(listingController.ShowListing))
//   .put(
//     isLoggedIn,
//     isOwner,
//     upload.single("listing[image]"),
//     validatelistings,
//     Wrapasync(listingController.updateListing)
//   )
//   .delete(isLoggedIn, isOwner, Wrapasync(listingController.destroyListing));

// // EDIT route
// router.get("/:id/edit",
//   isLoggedIn,
//   isOwner,
//   Wrapasync(listingController.editListing)
// );

// // BOOK routes (GET + POST)
// router.get("/:id/book",
//   isLoggedIn,
//   Wrapasync(listingController.bookListing)
// );

// router.post("/:id/book",
//   isLoggedIn,
//   (req, res) => {
//     const { id } = req.params;
//     const { guestName, guestAge, checkIn, checkOut, guests, paymentMethod } = req.body;

//     console.log({
//       guestName,
//       guestAge,
//       checkIn,
//       checkOut,
//       guests,
//       paymentMethod,
//     });

//     req.flash(
//       "success",
//       `🎉 Booking confirmed for ${guestName} (${guestAge} yrs)`
//     );
//     res.redirect(`/listings/${id}`);
//   }
// );

// module.exports = router;
const express = require("express");
const router = express.Router();
const Wrapasync = require("../utils/Wrapasync.js");
const { isLoggedIn, isOwner, validatelistings } = require("../views/middleware.js");
const listingController = require("../controller/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// INDEX + CREATE
router.route("/")
  .get(Wrapasync(listingController.indexListing))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validatelistings,
    Wrapasync(listingController.createListing)
  );

// 🔍 SEARCH ROUTE (ADDED)
router.get("/search", Wrapasync(listingController.searchListing));

// NEW
router.get("/new", isLoggedIn, listingController.NewListing);

// SHOW + UPDATE + DELETE
router.route("/:id")
  .get(Wrapasync(listingController.ShowListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validatelistings,
    Wrapasync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, Wrapasync(listingController.destroyListing));

// EDIT
router.get("/:id/edit",
  isLoggedIn,
  isOwner,
  Wrapasync(listingController.editListing)
);

// BOOK
router.get("/:id/book", isLoggedIn, Wrapasync(listingController.bookListing));

router.post("/:id/book", isLoggedIn, listingController.createBooking);

module.exports = router;
