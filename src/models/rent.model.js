const mongoose = require("mongoose");

const rentSchema = new mongoose.Schema(
    {
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing",
            required: true
        },
        renter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        totalAmount: { type: Number, required: true }, // pricePerDay * days
        paymentMethod: {
            type: String,
            enum: ["cod", "razorpay"], // ✅ Added enum validation
            default: "cod"
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "completed"],
            default: "pending"
        }
    }
    , {
        timestamps: true,
    }
);

module.exports = mongoose.model("Rent", rentSchema);
