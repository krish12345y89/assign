import express from 'express';
import {
  getAllReviews,
  updateReview,
  deleteReview,
  createReview,
    getPartnerReviews
} from "../contorllers/reviewContorller.js"
import protect from "../middlewares/authMiddleware.js"
import authorizeRoles from '../middlewares/roleMiddleware.js';
import { apiLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();
router.use(apiLimiter);

router.get('/', protect, authorizeRoles('admin'), getAllReviews);
router.put('/:id', protect, authorizeRoles('admin'), updateReview);
router.delete('/:id', protect, authorizeRoles('admin'), deleteReview);
router.post('/create', protect, createReview);
router.get('/partner/:partnerId', getPartnerReviews); 

export default router;
