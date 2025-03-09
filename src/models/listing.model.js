const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        category: {
            type: String,
            enum: ["appliance", "furniture", "vehicle", "gadget"],
            required: true
        },
        pricePerDay: {
            type: Number,
            required: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        image: {
            type: String,
            required: true
        },
        available: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Listing", listingSchema);
