const mongoose = require("mongoose");
const Listing = require("../models/listings");
const User = require("../models/user");
const { inferListingCategory } = require("../utils/listingCategories");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const curatedHotels = [
  {
    title: "Goa Coastline Retreat",
    description:
      "A stylish seaside hotel with breezy rooms, beach access, and quick booking for a relaxing Goa getaway.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    },
    price: 7800,
    location: "Calangute, Goa",
    country: "India",
    category: "trending",
    geometry: {
      type: "Point",
      coordinates: [73.7639, 15.5439],
    },
  },
  {
    title: "King Bed Suites Mumbai",
    description:
      "Modern hotel rooms with plush king beds, city views, and an easy stay experience for couples and families.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
    },
    price: 9200,
    location: "Bandra, Mumbai",
    country: "India",
    category: "bed",
    geometry: {
      type: "Point",
      coordinates: [72.8404, 19.0596],
    },
  },
  {
    title: "Jaipur Heritage Palace Stay",
    description:
      "An iconic heritage hotel near Jaipur's landmarks with royal interiors and a memorable old-city experience.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    },
    price: 11000,
    location: "Jaipur, Rajasthan",
    country: "India",
    category: "iconic",
    geometry: {
      type: "Point",
      coordinates: [75.7873, 26.9124],
    },
  },
  {
    title: "Himalayan Ridge Hotel",
    description:
      "A mountain-view hotel with cozy rooms, sunrise balconies, and direct access to the beauty of Manali.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
    },
    price: 8600,
    location: "Manali, Himachal Pradesh",
    country: "India",
    category: "mountain",
    geometry: {
      type: "Point",
      coordinates: [77.1892, 32.2432],
    },
  },
  {
    title: "Blue Lagoon Pool Resort",
    description:
      "A resort stay built around a large swimming pool, garden deck, and laid-back vacation vibe in Udaipur.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
    },
    price: 9800,
    location: "Udaipur, Rajasthan",
    country: "India",
    category: "pool",
    geometry: {
      type: "Point",
      coordinates: [73.7125, 24.5854],
    },
  },
  {
    title: "Starlit Camp Retreat",
    description:
      "Book a glamping-style camp with riverside tents, bonfire evenings, and adventure activities near Rishikesh.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80",
    },
    price: 5400,
    location: "Rishikesh, Uttarakhand",
    country: "India",
    category: "camping",
    geometry: {
      type: "Point",
      coordinates: [78.2676, 30.0869],
    },
  },
  {
    title: "Mango Grove Farmstay",
    description:
      "A peaceful farmhouse stay surrounded by orchards, fresh food, and quiet open spaces near Nashik.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    },
    price: 6100,
    location: "Nashik, Maharashtra",
    country: "India",
    category: "farms",
    geometry: {
      type: "Point",
      coordinates: [73.7898, 19.9975],
    },
  },
  {
    title: "Snow Peak Chalet Gulmarg",
    description:
      "A winter-ready chalet hotel close to the slopes with warm interiors, snow views, and easy bookings.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80",
    },
    price: 12500,
    location: "Gulmarg, Jammu and Kashmir",
    country: "India",
    category: "snow",
    geometry: {
      type: "Point",
      coordinates: [74.3805, 34.0484],
    },
  },
  {
    title: "Golden Dunes Desert Camp",
    description:
      "A desert camp stay with dune views, cultural evenings, and a bookable oasis-style experience in Jaisalmer.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    },
    price: 7000,
    location: "Jaisalmer, Rajasthan",
    country: "India",
    category: "desert",
    geometry: {
      type: "Point",
      coordinates: [70.9083, 26.9157],
    },
  },
];

async function main() {
  await mongoose.connect(MONGO_URL);

  const ownerFromListing = await Listing.findOne().select("owner").lean();
  const firstUser = await User.findOne().select("_id").lean();
  const ownerId = ownerFromListing?.owner || firstUser?._id;

  if (!ownerId) {
    throw new Error("No user found to assign as owner for category hotels.");
  }

  const curatedTitles = curatedHotels.map((hotel) => hotel.title);
  const inferenceCandidates = await Listing.find({
    title: { $nin: curatedTitles },
    $or: [
      { category: { $exists: false } },
      { category: null },
      { category: "" },
      { category: "trending" },
    ],
  });

  let updatedCount = 0;
  for (const listing of inferenceCandidates) {
    const inferredCategory = inferListingCategory({
      title: listing.title,
      description: listing.description,
      location: listing.location,
      country: listing.country,
    });

    if (listing.category === inferredCategory) {
      continue;
    }

    listing.category = inferredCategory;
    await listing.save();
    updatedCount += 1;
  }

  let insertedCount = 0;
  for (const hotel of curatedHotels) {
    const existingListing = await Listing.findOne({ title: hotel.title }).select("_id");
    if (existingListing) {
      continue;
    }

    await Listing.create({
      ...hotel,
      owner: ownerId,
      category: inferListingCategory(hotel),
    });
    insertedCount += 1;
  }

  console.log(
    `Category setup complete. Updated ${updatedCount} existing listings and inserted ${insertedCount} hotel listings.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
