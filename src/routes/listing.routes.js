// Initialize express router
const express = require("express");
const passport = require("passport");
const { isLoggedIn } = require("../middlewares/auth.middleware.js");
const {
    createListing,
    getAllListings,
    getListingById,
    updateListing,
    deleteListing,
    getNewListingForm,
    getEditListingForm,
} = require("../controllers/listing.controllers.js");

// Include Multer middleware for handling file uploads in listing creation
const upload = require("../middlewares/multer.middleware.js");


const router = express.Router();

// ✅ Ensure Express JSON Middleware is Applied to the Router
router.use(express.json());
router.use(express.urlencoded({ extended: true }));


// 🔥 Create a new listing (Authenticated)
router.post("/", isLoggedIn, upload.single("image"), createListing);

// 🔥 Get all listings (Public)
router.get("/", getAllListings);

// �� Get new listing form (Authenticated)
router.get("/new", isLoggedIn, getNewListingForm);

// 🔥 Get a single listing by ID (Public)
router.get("/:id", getListingById);

//update listing form
router.get("/:id/edit", isLoggedIn, getEditListingForm);

// 🔥 Update listing (Only Owner)
router.put("/:id", upload.single("image"), isLoggedIn, updateListing);

// 🔥 Delete listing (Only Owner)
router.delete("/:id", isLoggedIn, deleteListing);

module.exports = router;
