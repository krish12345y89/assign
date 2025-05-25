import express from 'express';
import {
  getAdminDashboardStats, getAllInquiries, getCategories, getLocations,
  createCategory, createLocation, updateCategory, updateLocation,
  deleteCategory, deleteLocation, getPartnerDetails, getPartnerEnquiries,
  getPendingPartners, verifyPartner, assignPartner,
  getAllAssignedInquiries,
  getAllPendingInquiries,
  getAssignedPartners,
  getVerifiedPartners,
  getAllPartners
} from '../contorllers/adminController.js';
import { getAssignedInquiries } from '../contorllers/InquiryController.js';
import protect from "../middlewares/authMiddleware.js";
import checkRole from '../middlewares/roleMiddleware.js';
import { verifyAdmin } from '../middlewares/adminMiddeware.js';
import { apiLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

router.use(apiLimiter);

router.get('/stats', protect, checkRole('admin'), getAdminDashboardStats);
router.get('/partners/pending', protect, checkRole('admin'), getPendingPartners);
router.get('/partners/assigned', protect, checkRole('admin'), getAssignedPartners);
router.get('/partners/all', protect, checkRole('admin'), getAllPartners);
router.get('/partners/verified', protect, checkRole('admin'), getVerifiedPartners);
router.put('/partners/:id/status', protect, checkRole('admin'), verifyPartner);
router.put('/partners/:enquiryId/assign', protect, checkRole('admin'), assignPartner);
router.get('/inquiries', protect, checkRole('admin'), getAllInquiries);
router.get('/partners/:id/details', protect, checkRole('admin'), getPartnerDetails);
router.get('/inquiries/allAssigned', protect, checkRole('admin'), getAllAssignedInquiries);
router.get('/inquiries/allPending', protect, checkRole('admin'), getAllPendingInquiries);

// Categories
router.get('/categories', verifyAdmin, protect, checkRole('admin'), getCategories);
router.post('/categories', verifyAdmin, protect, checkRole('admin'), createCategory);
router.put('/categories/:id', verifyAdmin, protect, checkRole('admin'), updateCategory);
router.delete('/categories/:id', verifyAdmin, protect, checkRole('admin'), deleteCategory);

// Locations
router.get('/locations', verifyAdmin, protect, checkRole('admin'), getLocations);
router.post('/locations', verifyAdmin, protect, checkRole('admin'), createLocation);
router.put('/locations/:id', verifyAdmin, protect, checkRole('admin'), updateLocation);
router.delete('/locations/:id', verifyAdmin, protect, checkRole('admin'), deleteLocation);

export default router;
