const apiError = require("../utils/apiError.js");
const apiResponse = require("../utils/apiResponse.js");
const asyncHandler = require("../utils/asyncHandler.js");
const Listing = require("../models/listing.model.js");
const User = require("../models/user.model.js");
const fs = require("fs");

const {
    uploadOnCloudinary,
    deleteFromCloudinary,
} = require("../utils/cloudinary.js");

// ✅ Create a new listing
const createListing = asyncHandler(async (req, res) => {
    let image = null; // ✅ Declare image outside try block

    try {
        const { title, description, category, pricePerDay } = req.body;
        if (!title || !description || !category || !pricePerDay) {
            throw new apiError(400, "All fields are required");
        }

        // ✅ 1. Ensure file is uploaded
        if (!req.file) {
            throw new apiError(400, "Missing listing image");
        }

        // ✅ 2. Check for uploaded file path
        const imageLocalPath = req.file?.path || null;
        if (!imageLocalPath) {
            throw new apiError(400, "Missing listing image");
        }

        // ✅ 3. Upload image to Cloudinary
        try {
            image = await uploadOnCloudinary(imageLocalPath);
            console.log("Image URL:", image);

            if (!image || !image.secure_url) {
                throw new Error("Image upload failed");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            throw new apiError(500, "Failed to upload image");
        }

        // ✅ 4. Create new listing
        const listingData = {
            title,
            description,
            category,
            pricePerDay,
            image: image.secure_url, // ✅ Use secure URL
            owner: req.user._id, // 👤 User creating the listing
        };

        const newListing = await Listing.create(listingData);
        // console.log("New Listing:", newListing);

        res.redirect("/listings");
    } catch (err) {
        // ✅ 5. Only delete from Cloudinary if upload was successful
        if (image && image.public_id) {
            await deleteFromCloudinary(image.public_id);
        }

        console.error("Error creating listing:", err.message, err.stack);
        res.status(500).json(new apiResponse("500", null, err.message || "Failed to create listing"));

    }
});


// ✅ Get all listings
const getAllListings = asyncHandler(async (req, res) => {
    try {
        const listings = await Listing.find().populate("owner", "username email");
        // console.log("Listings:", listings);
        res.render("listings/index.ejs", { listings });
    } catch (error) {
        console.log("Error fetching listings:", error);
        res.status(500).json(new apiResponse("500", null, "Failed to fetch listings"));
    }
});

// ✅ Get a single listing by ID
const getListingById = asyncHandler(async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id).populate("owner", "username email");
        if (!listing) return res.status(404).json(new apiError(404, "Listing not found"));
        // console.log("Listing:", listing);
        res.render("listings/show.ejs", { listing });
    } catch (error) {
        res.status(500).json(new apiError(500, "Failed to fetch listing"));
    }
});

// new listing form
const getNewListingForm = asyncHandler(async (req, res) => {
    // Define categories based on your schema enum
    const categories = ["appliance", "furniture", "vehicle", "gadget"];

    res.render("listings/new.ejs", { categories });
});

// get update form
const getEditListingForm = asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json(new apiError(404, "Listing not found"));
    const categories = ["appliance", "furniture", "vehicle", "gadget"];
    console.log("Listing:", listing);
    res.render("listings/update.ejs", { listing, categories });
});

// ✅ Update a listing (Only Owner)
const updateListing = asyncHandler(async (req, res) => {
    let image = null;

    try {
        const { title, description, category, pricePerDay } = req.body;
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json(new apiError(404, "Listing not found"));
        }

        // 📤 Upload new image if provided
        if (req.file) {
            const imageLocalPath = req.file.path;

            image = await uploadOnCloudinary(imageLocalPath);
            if (!image || !image.secure_url || !image.public_id) {
                throw new Error("Image upload failed");
            }

            // 🗑️ Delete old image only after successful upload
            if (listing.image) {
                const oldPublicId = listing.image.split("/").pop().split(".")[0]; // Extract public_id
                await deleteFromCloudinary(oldPublicId);
            }

            fs.unlink(imageLocalPath, (err) => {
                if (err) console.error("Error deleting local file:", err);
            });

            listing.image = image.secure_url;
        }

        // 📝 Update listing fields
        listing.title = title || listing.title;
        listing.description = description || listing.description;
        listing.category = category || listing.category;
        listing.pricePerDay = pricePerDay || listing.pricePerDay;

        await listing.save();
        res.redirect(`/listings/${listing._id}`);
    } catch (error) {
        console.error("Error updating listing:", error);
        res.status(500).json(new apiError(500, "Failed to update listing"));
    }
});


// ✅ Delete a listing (Only Owner)
const deleteListing = asyncHandler(async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json(new apiError(404, "Listing not found"));

        if (listing.image) await deleteFromCloudinary(listing.image);
        await listing.deleteOne();
        res.redirect("/listings");
    } catch (error) {
        console.error("Error deleting listing:", error);
        res.status(500).json(new apiError(500, "Failed to delete listing"));
    }
});

module.exports = {
    createListing,
    getAllListings,
    getListingById,
    updateListing,
    deleteListing,
    getNewListingForm,
    getEditListingForm,
}