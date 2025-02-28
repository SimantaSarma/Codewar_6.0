const apiError = require("../utils/apiError.js");
const apiResponse = require("../utils/apiResponse.js");
const asyncHandler = require("../utils/asyncHandler.js");
const Listing = require("../models/listing.model.js");
const User = require("../models/user.model.js");
const fs = require("fs");
const Rent = require("../models/rent.model.js");
const { throwDeprecation } = require("process");
const mongoose = require("mongoose");


// ✅ Create Rent Request
const createRentRequest = asyncHandler(async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        const { rentId } = req.params;

        // Validate input
        if (!startDate || !endDate) {
            return res.status(400).json({ statusCode: 400, message: "Start date and end date are required" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ statusCode: 400, message: "Invalid date format" });
        }

        if (start >= end) {
            return res.status(400).json({ statusCode: 400, message: "End date must be after start date" });
        }

        // Find the listing
        const listing = await Listing.findById(rentId);
        if (!listing) {
            return res.status(404).json({ statusCode: 404, message: "Listing not found" });
        }
        console.log("✅ Listing found:", listing);

        // Prevent self-renting
        if (listing.owner.toString() === req.user._id.toString()) {
            return res.status(400).json({ statusCode: 400, message: "You cannot rent your own listing" });
        }

        // Calculate rental days
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const totalAmount = listing.pricePerDay * days;

        // Check for overlapping rentals
        const existingRent = await Rent.findOne({
            item: rentId,
            status: { $in: ["pending", "approved"] },
            $or: [
                { startDate: { $lt: end, $gte: start } },
                { endDate: { $gt: start, $lte: end } },
            ],
        });

        if (existingRent) {
            return res.status(400).json({ statusCode: 400, message: "This item is already booked for the selected dates" });
        }

        // Create the rent request
        const rentRequest = await Rent.create({
            item: rentId,
            renter: req.user._id,
            owner: listing.owner,
            startDate: start,
            endDate: end,
            totalAmount,
            status: "pending",
        });

        console.log("✅ Rent request created:", rentRequest);

        res.status(201).json(new apiResponse(201, rentRequest, "Rent request created successfully"));
    } catch (error) {
        console.error("❌ Error creating rent request:", error);
        res.status(500).json({ statusCode: 500, message: error.message || "Failed to create rent request" });
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


// ✅ Get All Rent Requests (Admin/Owner)
const getAllRentRequests = asyncHandler(async (req, res) => {
    try {
        // If user is admin, show all rent requests
        let filter = {};
        if (req.user.role !== "admin") {
            filter = { owner: req.user._id };
        }

        const rentRequests = await Rent.find(filter).populate("renter owner", "name email title");

        console.log(`✅ Found ${rentRequests.length} rent requests`);
        res.status(200).json(new apiResponse(200, rentRequests, "All rent requests fetched successfully"));
    } catch (error) {
        console.error("❌ Error fetching rent requests:", error);
        res.status(500).json({ statusCode: 500, message: error.message || "Failed to fetch rent requests" });
    }
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



module.exports = {
    createRentRequest,
    updateRentStatus,
    getAllRentRequests,
    getUserRentRequests,
    completeRent
};