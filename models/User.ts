import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // Node.js built-in crypto module

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    isAdmin: boolean;
    address?: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
    }[];
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    matchPassword(enteredPassword: string): Promise<boolean>;
    getResetPasswordToken(): string; // Method to generate token
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: true },
    address: [{
        street: { type: String },
        city: { type: String },
        postalCode: { type: String },
        country: { type: String },
    }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true });

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
UserSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire (10 minutes from now)
    this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

    return resetToken;
};

const User = mongoose.model<IUser>('User', UserSchema);
export default User;