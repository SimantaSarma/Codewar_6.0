const apiError = require("../utils/apiError.js");
const apiResponse = require("../utils/apiResponse.js");
const asyncHandler = require("../utils/asyncHandler.js");

const User = require("../models/user.model.js");

// ✅ Register a new user
const registerUser = asyncHandler(async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);

        res.redirect("/listings");
    } catch (err) {
        console.error("Error while register user:", err); // Log for debugging
        throw new apiError(500, err.message);
    }
});

// render login form
const loginForm = (req, res) => {
    res.render("users/login");
};

// ✅ Login a user
const loginUser = asyncHandler(async (req, res) => {
    req.flash("success", "Successfully logged in");
    res.redirect("/listings");
});

// logout
const logOut = asyncHandler(async (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Logged Out Successfully");
        res.redirect("/listings");
    })
});


module.exports = {
    registerUser,
    loginForm,
    loginUser,
    logOut,
};
