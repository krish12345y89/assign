import express from 'express';
import {
  createInquiry,
  deleteClientInquiry,
  getAssignedInquiries,
  getClientInquiryById,
  updateClientInquiry,
  updateInquiryStatus
} from '../contorllers/InquiryController.js';
import protect from '../middlewares/authMiddleware.js';
import checkRole from '../middlewares/roleMiddleware.js';
import { apiLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

router.use(apiLimiter);

router.post(
  '/submit',
  protect,
  checkRole('client'),
  createInquiry
);

router.get(
  '/assigned',
  protect,
  checkRole('partner'),
  getAssignedInquiries
);

router.put(
  '/:id/status',
  protect,
  checkRole('partner'),
  updateInquiryStatus
);
router.put(
  '/:id',
  protect,
  checkRole('client'),
  updateClientInquiry
);

router.delete(
  '/:id',
  protect,
  checkRole('client'),
  deleteClientInquiry
);
router.get(
  '/:id',
  protect,
  checkRole('client'),
  getClientInquiryById
);

export default router;
