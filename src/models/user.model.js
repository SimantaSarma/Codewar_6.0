const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportlocalmongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    // Field for checking the admin
    isAdmin: { // Add this field
        type: Boolean,
        default: false // Default is false for regular users
    }
});

userSchema.plugin(passportlocalmongoose);
module.exports = mongoose.model("User", userSchema);
