import express from 'express';
import { submitPartnerDetails, addPortfolioItem, editPortfolioItem, deletePortfolioItem, reorderPortfolioItems, getAllPortfolioItems, getPortfolioItemById } from "../contorllers/partnerController.js"
import protect from "../middlewares/authMiddleware.js"
import authorizeRoles from '../middlewares/roleMiddleware.js';
import { apiLimiter } from '../middlewares/rateLimitMiddleware.js';
import { getAssignedInquiries } from '../contorllers/InquiryController.js';
import { getPartnerDetails, getPartnerEnquiries } from '../contorllers/adminController.js';

const router = express.Router();
router.use(apiLimiter);
router.post(
  '/onboard',
  protect,
  authorizeRoles('partner'),
  submitPartnerDetails
);
router.post('/portfolio', protect, authorizeRoles('partner'), addPortfolioItem);
router.get('/inquiries/assigned', protect, authorizeRoles('partner'), getAssignedInquiries);
// Edit portfolio item
router.put('/portfolio/:id', protect, authorizeRoles('partner'), editPortfolioItem);

// Delete portfolio item
router.delete('/portfolio/:id', protect, authorizeRoles('partner'), deletePortfolioItem);

// Reorder portfolio items
router.put('/portfolio/reorder', protect, authorizeRoles('partner'), reorderPortfolioItems);

router.get('/portfolio', protect, authorizeRoles('partner'), getAllPortfolioItems);

router.get('/portfolio/:id', protect, authorizeRoles('partner'), getPortfolioItemById);
router.get('/inquiries', protect, authorizeRoles('partner'), getPartnerEnquiries);
router.get('/', protect, authorizeRoles('partner'), getPartnerDetails);

export default router;