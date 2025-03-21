const apiError = require("../utils/apiError.js");
const apiResponse = require("../utils/apiResponse.js");
const asyncHandler = require("../utils/asyncHandler.js");
const Listing = require("../models/listing.model.js");
const User = require("../models/user.model.js");
const fs = require("fs");
const Rent = require("../models/rent.model.js");
const { throwDeprecation } = require("process");
const mongoose = require("mongoose");


//checkout
const checkOut = asyncHandler(async (req, res) => {
    try {
        const { itemId } = req.params;
        const listing = await Listing.findById(itemId);
        if (!listing) {
            return res.status(404).json(new apiError(404, "Listing not found"));
        }
        res.render("listings/checkout.ejs", { listing });
    } catch (error) {
        console.error("❌ Error rendering checkout page:", error);
        res.status(500).json(new apiError(500, "Failed to render checkout page"));
    }
})

const createRentRequest = asyncHandler(async (req, res) => {
    try {
        console.log("🔍 Request Body:", req.body); // Debugging

        const { startDate, endDate, paymentMethod: rawPaymentMethod } = req.body;
        const { itemId } = req.params;

        console.log("🔍 itemId:", itemId); // Debugging

        if (!startDate || !endDate) {
            return res.status(400).json(new apiError(400, "Start date and end date are required"));
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
            return res.status(400).json(new apiError(400, "Invalid date range"));
        }

        const listing = await Listing.findById(itemId);
        if (!listing) return res.status(404).json(new apiError(404, "Listing not found"));

        if (!listing.pricePerDay) {
            return res.status(400).json(new apiError(400, "Listing price per day is missing"));
        }

        if (listing.owner.toString() === req.user._id.toString()) {
            return res.status(400).json(new apiError(400, "You cannot rent your own listing"));
        }

        // ✅ Convert paymentMethod to lowercase and validate
        const paymentMethod = rawPaymentMethod?.toLowerCase();
        const validPaymentMethods = ["cod", "credit_card", "paypal", "bank_transfer"];
        if (!validPaymentMethods.includes(paymentMethod)) {
            return res.status(400).json(new apiError(400, "Invalid payment method"));
        }

        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const totalAmount = listing.pricePerDay * days;

        const existingRent = await Rent.findOne({
            item: itemId,
            status: { $in: ["pending", "approved"] },
            $or: [{ startDate: { $lt: end }, endDate: { $gt: start } }],
        });

        if (existingRent) {
            return res.status(400).json(new apiError(400, "Item already booked for selected dates"));
        }

        const rentRequest = await Rent.create({
            item: itemId,
            renter: req.user._id,
            owner: listing.owner,
            startDate: start,
            endDate: end,
            totalAmount,
            paymentMethod,
            status: "pending",
        });

        req.flash("success", "Rent request created successfully");
        return res.redirect(`/listings/${itemId}`);
    } catch (error) {
        console.error("❌ Error creating rent request:", error);
        return res.status(500).json(new apiError(500, "Failed to create rent request"));
    }
});

const updateRentStatus = asyncHandler(async (req, res) => {
    try {
        const { status } = req.body;
        const { rentId } = req.params;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(rentId)) {
            return res.status(400).json(new apiError(400, "Invalid rent request ID format"));
        }

        const rentRequest = await Rent.findById(rentId);

        if (!rentRequest) {
            return res.status(404).json(new apiError(404, "Rent request not found"));
        }

        // Validate status
        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json(new apiError(400, "Invalid status. Allowed: 'approved', 'rejected'"));
        }

        // Only owner can approve/reject
        if (rentRequest.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json(new apiError(403, "You are not authorized to update this rent request"));
        }

        rentRequest.status = status;
        await rentRequest.save();

        res.status(200).json(new apiResponse(200, rentRequest, `Rent request ${status} successfully`));
    } catch (error) {
        console.error("Error updating rent status:", error);
        res.status(500).json(new apiError(500, "Failed to update rent request"));
    }
});


// 📌 Get All Rent Requests (Admin/Owner)
const getAllRentRequests = asyncHandler(async (req, res) => {
    let filter = req.user.role === "admin" ? {} : { owner: req.user._id };

    const rentRequests = await Rent.find(filter)
        .populate("renter owner", "name email")
        .populate("item", "title pricePerDay image");

    res.render("users/rentRequests.ejs", { rentRequests, user: req.user });
});


// ✅ Get User's Rent Requests
const getUserRentRequests = asyncHandler(async (req, res) => {
    try {
        console.log("🔹 Fetching rent requests for user:", req.user._id);

        const rentRequests = await Rent.find({ renter: req.user._id })
            .populate("item owner", "name email title");

        console.log(`✅ Found ${rentRequests.length} rent requests`);
        res.status(200).json(new apiResponse(200, rentRequests, "User's rent requests fetched successfully"));
    } catch (error) {
        console.error("❌ Error fetching user rent requests:", error);
        res.status(500).json({ statusCode: 500, message: error.message || "Failed to fetch user rent requests" });
    }
});

// ✅ Complete Rent Request (Owner)
const completeRent = asyncHandler(async (req, res) => {
    try {
        const { rentId } = req.params;

        // ✅ Validate rentId format
        if (!mongoose.Types.ObjectId.isValid(rentId)) {
            return res.status(400).json(new apiError(400, "Invalid rent request ID format"));
        }


        // ✅ Find rent request
        const rentRequest = await Rent.findById(rentId);
        if (!rentRequest) {
            console.log("❌ Rent request not found!");
            return res.status(404).json(new apiError(404, "Rent request not found"));
        }


        // ✅ Print important values
        const today = new Date();
        const rentEndDate = new Date(rentRequest.endDate);


        // ✅ Rental period validation
        if (rentEndDate > today) {
            return res.status(400).json(new apiResponse(400, null, "Rent period has not ended yet"));
        }

        // ✅ Mark as completed
        rentRequest.status = "completed";
        await rentRequest.save();

        res.status(200).json(new apiResponse(200, rentRequest, "Rent marked as completed successfully"));
    } catch (error) {
        console.error("❌ Error completing rent:", error);
        res.status(500).json({ statusCode: 500, message: error.message || "Failed to complete rent" });
    }
});

// ✅ Rent Details Page
const getRentDetailsPage = asyncHandler(async (req, res) => {
    try {
        const { rentId } = req.params;
        const rentRequest = await Rent.findById(rentId).populate("item renter owner");

        if (!rentRequest) {
            return res.render("error", { message: "Rent request not found", statusCode: 404 });
        }

        res.render("rent/details", { rentRequest });
    } catch (error) {
        console.error("❌ Error fetching rent details:", error);
        res.render("error", { message: "Failed to fetch rent details", statusCode: 500 });
    }
});


module.exports = {
    createRentRequest,
    updateRentStatus,
    getAllRentRequests,
    getUserRentRequests,
    completeRent,
    checkOut,
    getRentDetailsPage,
};