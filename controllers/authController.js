

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const passport = require('passport');
const { transporter, getHtmlTemplate } = require('../services/mailer');
const asyncHandler = require('../middleware/asyncHandler');


const generateOtp = () => crypto.randomInt(100000, 999999).toString();





exports.getRegister = (req, res) => {
    res.render('register');
};



exports.postRegister = asyncHandler(async (req, res) => {
    const { email, password, displayName } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        req.flash('error', 'A user with that email already exists.');
        return res.redirect('/auth/register');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOtp();

    await User.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        displayName,
        otp,
        otpExpires: Date.now() + 3600000,
    });


    await sendOtpEmail(email, otp);

    req.flash('info', 'An OTP has been sent to your email. Please verify your account.');
    res.redirect(`/auth/verify?email=${email}`);
});



exports.getVerify = (req, res) => {
    res.render('verify', { email: req.query.email });
};



exports.postVerify = asyncHandler(async (req, res, next) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });

    if (!user) {
        req.flash('error', 'Invalid or expired OTP. Please try again.');
        return res.redirect(`/auth/verify?email=${email}`);
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    req.login(user, (err) => {
        if (err) return next(err);
        req.flash('success', 'Welcome! Your account has been verified.');
        res.redirect('/');
    });
});



exports.postResendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        req.flash('info', 'If this email is registered, a new OTP has been sent.');
        return res.redirect(`/auth/verify?email=${email}`);
    }

    if (user.isVerified) {
        req.flash('info', 'This account is already verified. Please log in.');
        return res.redirect('/auth/login');
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = Date.now() + 3600000;
    await user.save();

    await sendOtpEmail(email, otp);

    req.flash('info', 'A new OTP has been sent to your email.');
    res.redirect(`/auth/verify?email=${email}`);
});





exports.getLogin = (req, res) => {
    res.render('login');
};



exports.postLogin = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            req.flash('error', info.message);
            return res.redirect('/auth/login');
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            if (req.body.rememberMe) {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
            }
            res.redirect('/');
        });
    })(req, res, next);
};



exports.getLogout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash('success', 'You have been logged out.');
        res.redirect('/auth/login');
    });
};






exports.googleCallback = (req, res) => {
    req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    res.redirect('/');
};






exports.getForgotPassword = (req, res) => {
    res.render('forgot-password');
};



exports.postForgotPassword = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
        const token = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        user.resetToken = hashedToken;
        user.resetTokenExpires = Date.now() + 3600000;
        await user.save();

        const resetUrl = `http://${req.headers.host}/auth/reset/${token}`;
        await sendPasswordResetEmail(user.email, resetUrl);
    }

    req.flash('info', 'If an account with that email exists, a password reset link has been sent.');


    res.redirect('/auth/login');
});



exports.getResetPassword = asyncHandler(async (req, res) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        resetToken: hashedToken,
        resetTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/auth/forgot-password');
    }

    res.render('reset-password', { token: req.params.token });
});



exports.postResetPassword = asyncHandler(async (req, res, next) => {
    if (req.body.password !== req.body.confirmPassword) {
        req.flash('error', 'Passwords do not match.');
        return res.redirect(`/auth/reset/${req.params.token}`);
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        resetToken: hashedToken,
        resetTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/auth/forgot-password');
    }

    user.password = await bcrypt.hash(req.body.password, 12);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    req.login(user, (err) => {
        if (err) return next(err);
        req.flash('success', 'Your password has been reset successfully!');
        res.redirect('/');
    });
});



async function sendOtpEmail(email, otp) {
    const htmlContent = `
      <p style="margin: 0 0 20px 0; color: #333; font-size: 16px; line-height: 1.5;">
          Thank you for signing up! Please use the following One-Time Password (OTP) to verify your account. The code is valid for one hour.
      </p>
      <div align="center" style="padding: 10px; margin: 20px 0; font-size: 24px; letter-spacing: 5px; background-color: #f2f2f2; border-radius: 8px; color: #333;">
          ${otp}
      </div>`;

    await transporter.sendMail({
        to: email,
        from: `Task Manager <${process.env.EMAIL_USER}>`,
        subject: 'Your Verification Code',
        html: getHtmlTemplate('Verify Your Account', htmlContent)
    });
}

async function sendPasswordResetEmail(email, resetUrl) {
    const htmlContent = `
      <p style="margin: 0 0 20px 0; color: #333; font-size: 16px; line-height: 1.5;">
          You requested a password reset. Please click the button below to set a new password. This link is valid for one hour.
      </p>
      <p style="margin: 0 0 20px 0; color: #333; font-size: 16px; line-height: 1.5;">
          If you did not request this, please ignore this email.
      </p>`;
    const button = `<a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; background-color: #A78BFA; border-radius: 6px;">Reset Your Password</a>`;

    await transporter.sendMail({
        to: email,
        from: `Task Manager <${process.env.EMAIL_USER}>`,
        subject: 'Password Reset Request',
        html: getHtmlTemplate('Reset Your Password', htmlContent, button)
    });
}