import express from 'express';
import {
    authUser,
    registerUser,
    getUserProfile,
    updateUserProfile,
    forgotPassword,
    resetPassword,
} from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

// New routes for password reset
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);

export default router;
