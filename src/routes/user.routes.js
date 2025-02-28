const express = require("express");
const passport = require("passport");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { registerUser, loginUser, loginForm, logOut, } = require("../controllers/user.controllers.js");

const router = express.Router();

router.post("/register", registerUser); // ✅ User registration

router.get("/login", loginForm);

router.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
}), loginUser); // ✅ User login via passport



router.get("/logout", logOut); // ❌ Logout user

module.exports = router;
