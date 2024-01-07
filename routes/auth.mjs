import express from "express";
import passport from "passport";

import "../passport.mjs";

const router = express.Router();

// const CLIENT_URL = "http://localhost:3000"; =======> client url development
const CLIENT_URL = "/"; // ===========================> client url production

// if login fail
router.get("/login/failed", (req, res) => {
    res.status(401).json({
        success: false,
        message: "failure",
    });
});

// logout
router.post("/logout", async(req, res, next) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: true,
    });

    res.clearCookie("token");
    res.redirect(CLIENT_URL);
    req.logout();

    console.log("logout done");
});

// social logins

// google: actual api to hit
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// google: callback api to redirect to homepage
router.get(
    "/google/callback",
    passport.authenticate("google", {
        successRedirect: CLIENT_URL, // redirect to homepage on success
        failureRedirect: "/login/failed", //redirect to error on error
    })
);

// facebook: actual api to hit
router.get(
    "/facebook",
    passport.authenticate("facebook")
);

// facebook: callback api to redirect to homepage
router.get(
    "/facebook/callback",
    passport.authenticate("facebook", {
        successRedirect: CLIENT_URL, // redirect to homepage on success
        failureRedirect: "/login/failed", //redirect to error on error
    })
);

// github: actual api to hit
router.get(
    "/github", passport.authenticate("github", { scope: ["user: email"] })
);

// github: callback api to redirect to homepage
router.get(
    "/github/callback",
    passport.authenticate("github", {
        successRedirect: CLIENT_URL, // redirect to homepage on success
        failureRedirect: "/login/failed", //redirect to error on error
    })
);

export default router;