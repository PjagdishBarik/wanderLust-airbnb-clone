const LISTING_CATEGORIES = [
  "trending",
  "bed",
  "iconic",
  "mountain",
  "pool",
  "camping",
  "farms",
  "snow",
  "desert",
];

const CATEGORY_KEYWORDS = {
  iconic: [
    "iconic",
    "heritage",
    "historic",
    "history",
    "palace",
    "fort",
    "castle",
    "landmark",
    "temple",
    "monument",
    "jagannath",
    "nalanda",
  ],
  mountain: [
    "mountain",
    "hill",
    "hills",
    "peak",
    "valley",
    "alpine",
    "highland",
    "himalaya",
    "manali",
    "gulmarg",
    "banff",
    "aspen",
  ],
  pool: [
    "pool",
    "swimming",
    "infinity",
    "lagoon",
  ],
  camping: [
    "camp",
    "camping",
    "tent",
    "glamp",
    "glamping",
    "campground",
    "campsite",
  ],
  farms: [
    "farm",
    "farms",
    "farmhouse",
    "ranch",
    "orchard",
    "vineyard",
    "grove",
  ],
  snow: [
    "snow",
    "ski",
    "winter",
    "chalet",
    "glacier",
    "ice",
    "alps",
  ],
  desert: [
    "desert",
    "dune",
    "dunes",
    "oasis",
    "safari",
    "dubai",
    "thar",
    "jaisalmer",
  ],
  bed: [
    "bed",
    "suite",
    "room",
    "rooms",
    "boutique hotel",
    "hotel",
    "stay",
    "loft",
    "apartment",
    "penthouse",
  ],
};

function normalizeCategory(category) {
  if (!category || typeof category !== "string") {
    return null;
  }

  const normalized = category.trim().toLowerCase();
  return LISTING_CATEGORIES.includes(normalized) ? normalized : null;
}

function listingSearchText(listing = {}) {
  return [
    listing.title,
    listing.description,
    listing.location,
    listing.country,
    listing.category,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function inferListingCategory(listing = {}) {
  const explicitCategory = normalizeCategory(listing.category);
  if (explicitCategory) {
    return explicitCategory;
  }

  const searchText = listingSearchText(listing);

  for (const category of Object.keys(CATEGORY_KEYWORDS)) {
    const hasMatch = CATEGORY_KEYWORDS[category].some((keyword) =>
      searchText.includes(keyword)
    );

    if (hasMatch) {
      return category;
    }
  }

  return "trending";
}

function matchesCategory(listing = {}, category) {
  const normalizedCategory = normalizeCategory(category);
  if (!normalizedCategory) {
    return true;
  }

  return inferListingCategory(listing) === normalizedCategory;
}

module.exports = {
  LISTING_CATEGORIES,
  inferListingCategory,
  matchesCategory,
  normalizeCategory,
};
