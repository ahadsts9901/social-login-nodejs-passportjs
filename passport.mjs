import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GithubStrategy } from "passport-github-2";
import { userModel } from "./schema.mjs";
import passport from "passport";
import "dotenv/config";
import jwt from "jsonwebtoken";

// google strategy from passport.js to get user data
passport.use(
    new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID, // get it from your google cloud console (free)
            clientSecret: process.env.GOOGLE_CLIENT_SECRET, // get it from your google cloud console (free)
            callbackURL: "/api/v1/auth/google/callback", // call back url ( place it to your google cloud project )
            passReqToCallback: true, // (for sending cookies)
        },
        async(req, accessToken, refreshToken, profile, done) => {
            console.log("googleData: ", profile);

            //  here you will get all user data in "profile variable"
            //  get the information you want and generate a JWT token
            //  and create your user in database

            const user = {
                name: profile._json.name,
                firstName: profile._json.given_name,
                lastName: profile._json.family_name,
                email: profile._json.email,
                isVerified: profile._json.email_verified,
                profilePhoto: profile._json.picture,
                provider: profile.provider,
            };

            // console.log(accessToken);

            // find user in my mongodb database
            const userData = await userModel
                .findOne({
                    email: user.email,
                })
                .exec();

            var createUser;

            // if user not found so create a new user
            if (!userData) {
                createUser = await userModel.create({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    isEmailVerified: user.isVerified,
                    profilePhoto: user.profilePhoto,
                    provider: user.provider,
                });
            }

            // generate a jwt token
            const token = jwt.sign({
                    isAdmin: false,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    _id: userData._id ? userData._id : createUser.insertedId,
                    profilePhoto: user.profilePhoto,
                    gender: userData.gender || null,
                    dateOfBirth: userData.dateOfBirth || null,
                    createdOn: userData.createdOn,
                    provider: user.provider,
                },
                process.env.SECRET, {
                    expiresIn: `24h`,
                }
            );

            // save token to cookies
            req.res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            });

            // done check with user object
            done(null, user);
        }
    )
);

// facebook strategy from passport.js to get user data
passport.use(
    new FacebookStrategy({
            clientID: process.env.FACEBOOK_APP_ID, // get it from your facebook meta for developers account (free)
            clientSecret: process.env.FACEBOOK_APP_SECRET, // get it from your facebook meta for developers account (free)
            callbackURL: "/api/v1/auth/facebook/callback", // place it to your meta developer account authenticated callback uris
            passReqToCallback: true, // (for sending cookies)
        },
        function(accessToken, refreshToken, profile, cb) {
            console.log("facebookData: ", profile);
            //  here you will get all user data in "profile variable"
            //  get the information you want and generate a JWT token
            //  and create your user in database
            // like provided in google strategy
        }
    )
);

// github strategy from passport.js to get user data
passport.use(
    new GithubStrategy({
            clientID: process.env.GITHUB_CLIENT_ID, // get it from your github account (free)
            clientSecret: process.env.GITHUB_CLIENT_SECRET, // get it from your github account (free)
            callbackURL: "/api/v1/auth/github/callback", // place it to your github account authenticated callback uris
            passReqToCallback: true, // (for sending cookies)
        },
        function(accessToken, refreshToken, profile, done) {
            console.log("githubData: ", profile);
            //  here you will get all user data in "profile variable"
            //  get the information you want and generate a JWT token
            //  and create your user in database
            // like provided in google strategy
        }
    )
);

// serialize user
passport.serializeUser((user, done) => {
    done(null, user); // serializing the entire user object
});

// deserialize user
passport.deserializeUser((user, done) => {
    done(null, user); // deserializing the entire user object
});