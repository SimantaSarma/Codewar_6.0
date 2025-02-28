const apiError = require("../utils/apiError.js");
const apiResponse = require("../utils/apiResponse.js");
const Listing = require("../models/listing.model.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json(new apiResponse("401", null, "You must be logged in to access this route"));
    }
    next();
};

module.exports.isListingOwner = async (req, res, next) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json(new apiError(404, "Listing not found"));
        }

        if (!listing.owner.equals(req.user._id)) {
            return res.status(403).json(new apiError(403, "Forbidden: You are not the owner"));
        }

        next(); // User is owner, proceed
    } catch (error) {
        console.error("Error checking listing owner:", error);
        return res.status(500).json(new apiError(500, "Internal Server Error"));
    }
};