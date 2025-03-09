const express = require("express");
const cors = require("cors");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local"); // ✅ Fixed variable case
const flash = require("express-flash");
const apiError = require("./utils/apiError.js"); // Ensure this file correctly extends `Error`
const apiResponse = require("./utils/apiResponse.js");

const User = require("./models/user.model.js");

dotenv.config(); // Load environment variables

const app = express();

// ✅ CORS Configuration
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:8000",
        credentials: true,
    })
);

// ✅ Session Configuration
const sessionOptions = {
    secret: process.env.SECRET || "mysecret",
    resave: false,
    saveUninitialized: false, // ✅ Prevents storing empty sessions
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // ✅ Secure cookies in production
    },
};

app.use(session(sessionOptions));
app.use(flash());

// ✅ Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ✅ Middleware to Add Global Variables
app.use(async (req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user || null;
    next();
});

// ✅ Middleware Setup
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(express.json()); // ✅ Only call once
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// ✅ Import Routes
const healthCheckRouter = require("./routes/healthCheck_route.js");
const userRouter = require("./routes/user.routes.js");
const listingRouter = require("./routes/listing.routes.js");
const rentRouter = require("./routes/rent.routes.js");

// ✅ API Routes
app.use("/healthcheck", healthCheckRouter);
app.use("/user", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/rent", rentRouter);

// ✅ Handle 404 Errors (Unknown Routes)
// ✅ Handle 404 Errors (Unknown Routes)
app.all("*", (req, res) => {
    return res.status(404).json(new apiResponse(404, null, "Page not found"));
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err);
    return res.status(err.statusCode || 500).json(
        new apiResponse(err.statusCode || 500, null, err.message || "Something went wrong")
    );
});
module.exports = app;
