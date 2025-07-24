import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import generateToken from '../utils/generateToken';
import sendEmail from '../utils/sendEmail';
import crypto from 'crypto';

interface AuthenticatedRequest extends Request {
    user?: IUser;
}

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user.id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user.id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findById(req.user!._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findById(req.user!._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password; // Password hashing handled by pre-save hook
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            token: generateToken(updatedUser.id),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        // Send a generic success message to prevent email enumeration
        return res.json({ message: 'If a user with that email exists, a password reset email has been sent.' });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false }); // Save user with token fields

    // Create reset URL for the client-side
    // IMPORTANT: Replace with your actual client-side reset password URL.
    // For React Native, this might be a deep link (e.g., `yourapp://resetpassword?token=${resetToken}`)
    // or a web URL to your dashboard/web client (e.g., `https://yourdashboard.com/resetpassword/${resetToken}`)
    // For this example, we'll use a generic placeholder URL.
    const resetUrl = `http://localhost:3000/resetpassword/${resetToken}`; // Example for web dashboard/client

    const message = `
        <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
        <p>Please click on the following link to reset your password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Token',
            message,
        });

        res.json({ message: 'Email sent successfully' });
    } catch (error: any) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        console.error(error);
        res.status(500).json({ message: 'Email could not be sent' });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
const resetPassword = async (req: Request, res: Response) => {
    // Get hashed token from URL parameter
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: new Date() }, // Token not expired
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = req.body.password; // Hashing handled by pre-save hook in User model
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: 'Password reset successfully' });
};

export {
    authUser,
    registerUser,
    getUserProfile,
    updateUserProfile,
    forgotPassword,
    resetPassword,
};
