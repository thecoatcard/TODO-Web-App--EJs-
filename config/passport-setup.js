const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
// const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    
    callbackURL: `${process.env.APP_URL}/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const existingUserByGoogleId = await User.findOne({ googleId: profile.id });
        if (existingUserByGoogleId) {
            return done(null, existingUserByGoogleId);
        }

        
        const userEmail = profile.emails[0].value;
        const existingUserByEmail = await User.findOne({ email: userEmail });

        if (existingUserByEmail) {
            
            existingUserByEmail.googleId = profile.id;
            existingUserByEmail.isVerified = true; 
            await existingUserByEmail.save();
            return done(null, existingUserByEmail);
        }

        
        const newUser = new User({
            googleId: profile.id,
            displayName: profile.displayName,
            email: userEmail,
            isVerified: true
        });
        await newUser.save();
        return done(null, newUser);

    } catch (err) {
        return done(err);
    }
}));



passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) { return done(null, false, { message: 'No user found with that email.' }); }
        if (!user.password) { return done(null, false, { message: 'You registered using Google. Please log in with Google.' }); }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) { return done(null, false, { message: 'Incorrect password.' }); }
        if (!user.isVerified) { return done(null, false, { message: 'Please verify your email first.' }); }

        return done(null, user);
    } catch (err) { return done(err); }
}));
