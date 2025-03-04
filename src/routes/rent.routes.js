const express = require("express");
const { isLoggedIn } = require("../middlewares/auth.middleware");
const {
    createRentRequest,
    updateRentStatus,
    getAllRentRequests,
    getUserRentRequests,
    completeRent,
    checkOut,
    getRentDetailsPage
} = require("../controllers/rent.controllers");

const router = express.Router();

// 📌 Get all rent requests (Admin/Owner)
router.get("/", isLoggedIn, getAllRentRequests);

// 📌 Get user's rent requests (FIXED: Moved above dynamic routes)
router.get("/my", isLoggedIn, getUserRentRequests);

// 📌 Render checkout page
router.get("/:itemId/checkout", isLoggedIn, checkOut);

// 📌 Create a new rent request
router.post("/:itemId", isLoggedIn, createRentRequest);

// 📌 Get rent details (FIXED: Placed after "/my" route)
router.get("/:rentId", isLoggedIn, getRentDetailsPage);

// 📌 Update rent status (Approve/Reject)
router.put("/:rentId/status", isLoggedIn, updateRentStatus);

// 📌 Mark rent as completed
router.put("/:rentId/complete", isLoggedIn, completeRent);

module.exports = router;
