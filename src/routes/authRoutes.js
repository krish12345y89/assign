import express from 'express';
import { signup, login, otpSend } from "../contorllers/authController.js";
import { authLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

router.post('/signup',authLimiter, signup);
router.post('/login', authLimiter,login);
router.post('/getOtp',authLimiter, otpSend);
router.get('/logout',authLimiter, (req, res) => {
    res.clearCookie('token').json({ message: 'Logged out successfully' });
});

export default router;
