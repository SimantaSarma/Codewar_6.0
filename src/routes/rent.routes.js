const express = require("express");
const { isLoggedIn, isListingOwner } = require("../middlewares/auth.middleware");
const {
    createRentRequest,
    updateRentStatus,
    getAllRentRequests,
    getUserRentRequests,
    completeRent
} = require("../controllers/rent.controllers");

const router = express.Router();

// 📌 Create a new rent request
router.post("/:itemId", isLoggedIn, createRentRequest);

// 📌 Update rent status (Approve/Reject)
router.put("/:rentId/status", isLoggedIn, updateRentStatus);

// 📌 Get all rent requests (Admin/Owner)
router.get("/", isLoggedIn, getAllRentRequests);

// 📌 Get user's rent requests
router.get("/my", isLoggedIn, getUserRentRequests);

// 📌 Mark rent as completed
router.put("/:rentId/complete", isLoggedIn, completeRent);

module.exports = router;
