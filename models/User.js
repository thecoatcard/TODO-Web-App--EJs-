

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String }, 
    displayName: { type: String, required: true },
    googleId: { type: String, unique: true, sparse: true }, 
    isVerified: { type: Boolean, default: false },
    otp: String,
    otpExpires: Date,
    resetToken: String,
    resetTokenExpires: Date,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);