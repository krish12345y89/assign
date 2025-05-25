import Inquiry from '../models/Inquiry.js';
import Partner from '../models/Partner.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import Category from '../models/Category.js';
import Location from '../models/Location.js';


export const getPendingPartners = async (req, res) => {
    const partners = await Partner.find({ status: 'pending' }).populate('user', 'email role');
    res.json(partners);
};

export const getAssignedPartners = async (req, res) => {
    const partners = await Partner.find({ status: 'verified' }).populate('user', 'email role');
    res.json(partners);
};
export const getAllPartners = async (req, res) => {
    const partners = await Partner.find({}).populate('user', 'email role');
    res.json(partners);
};
export const getVerifiedPartners = async (req, res) => {
    const partners = await Partner.find({ status: 'verified' }).populate('user', 'email role');
    res.json(partners);
};
export const verifyPartner = async (req, res) => {
    const { id } = req.params;
    const { status, comment } = req.body;
    console.log('Verifying partner:', id, status, comment);
    if (!['verified', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    const partner = await Partner.findOne({ user: id });
    if (!partner) return res.status(404).json({ message: 'Partner not found' });

    await Partner.updateOne(
        { user: id },
        {
            $set: {
                status: status,
                comment: comment || '',
            },
        },
        {
            new: true
        }
    );

    res.json({ message: `Partner ${status}`, partner });
};

export const assignPartner = async (req, res) => {
    const { enquiryId } = req.params;
    const { partnerId } = req.body;
    if (!partnerId) {
        return res.status(400).json({ message: 'Partner ID is required' });
    }
    const partner = await Partner.findOne({ user: partnerId });
    if (!partner) return res.status(404).json({ message: 'Partner not found' });
    if (partner.status !== 'verified') {
        return res.status(400).json({ message: 'Partner is not verified' });
    }
    if (!enquiryId) {
        return res.status(400).json({ message: 'Inquiry ID is required' });
    }
    const inquiry = await Inquiry.findById(enquiryId);
    if (!inquiry) {
        return res.status(404).json({ message: 'Inquiry not found' });
    }
    if (inquiry.assignedPartners.includes(partner.user)) {
        return res.status(400).json({ message: 'Partner already assigned to this inquiry' });
    }
    await Inquiry.updateOne(
        { _id: enquiryId },
        {
            $addToSet: { assignedPartners: partner.user },
            $set: { status: 'responded' }
        },
        {
            new: true
        }
    );
    await Partner.updateOne(
        { user: partnerId },
        {
            $addToSet: { enquiries: enquiryId },
        },
        {
            new: true
        }
    );
    res.json({ message: 'Partner assigned successfully', partner });

}

export const getPartnerDetails = async (req, res) => {
    const id = req.user._id;
    const partner = await Partner.findOne({user:id}).populate('user', 'email role');
    if (!partner) return res.status(404).json({ message: 'Partner not found' });
    res.json(partner);
};
export const getPartnerEnquiries = async (req, res) => {
    const id = req.user._id;
    console.log('Fetching enquiries for partner:', id);
    const partner = await Partner.findOne({ user: id })
    if (!partner) {
        return res.status(404).json({ message: 'Partner not found' });
    }
    const enquiries = await Inquiry.find({ assignedPartners: { $in: [id] } })
        .populate('client', 'email')
        .sort({ createdAt: -1 });

    if (!enquiries || enquiries.length === 0) {
        return res.status(404).json({ message: 'No enquiries assigned to this partner' });
    }
    res.json(enquiries);

}

export const getAllInquiries = async (req, res) => {
    const inquiries = await Inquiry.find({})
        .populate('client', 'email')
        .populate('assignedPartners', 'user email')
        .sort({ createdAt: -1 });
    if (!inquiries || inquiries.length === 0) {
        return res.status(404).json({ message: 'No inquiries found' });
    }
    res.json(inquiries);
};

export const getAdminDashboardStats = async (req, res) => {
    try {
        // Total Users grouped by role
        const userRoles = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        const totalUsers = userRoles.reduce((sum, item) => sum + item.count, 0);
        const usersByRole = Object.fromEntries(userRoles.map(r => [r._id, r.count]));

        // Total Partners grouped by status
        const partnerStatus = await Partner.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const partnersByStatus = Object.fromEntries(partnerStatus.map(p => [p._id, p.count]));

        // Total Featured Partners
        const featuredPartners = await Partner.countDocuments({ isFeatured: true });

        // Total Inquiries and grouped by status
        const inquiryStatus = await Inquiry.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const totalInquiries = inquiryStatus.reduce((sum, item) => sum + item.count, 0);
        const inquiriesByStatus = Object.fromEntries(inquiryStatus.map(i => [i._id, i.count]));

        // Total Assigned Inquiries (with at least one partner assigned)
        const assignedInquiries = await Inquiry.countDocuments({ assignedPartners: { $exists: true, $ne: [] } });

        // Total Rejected Inquiries (assuming `status: 'rejected'` exists)
        const rejectedInquiries = await Inquiry.countDocuments({ status: 'rejected' });

        // Total Reviews
        const totalReviews = await Review.countDocuments();

        res.json({
            totalUsers,
            usersByRole,
            totalPartners: Object.values(partnersByStatus).reduce((a, b) => a + b, 0),
            partnersByStatus,
            featuredPartners,
            totalInquiries,
            inquiriesByStatus,
            assignedInquiries,
            rejectedInquiries,
            totalReviews
        });

    } catch (error) {
        console.error('Admin KPI fetch failed:', error);
        res.status(500).json({ message: 'Failed to fetch admin stats' });
    }
};

// Category Controllers
export const getCategories = async (req, res) => {
    const categories = await Category.find();
    res.json(categories);
};

export const createCategory = async (req, res) => {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json({ message: 'Category created', category });
};

export const updateCategory = async (req, res) => {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Category updated', updated });
};

export const deleteCategory = async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
};

// Location Controllers
export const getLocations = async (req, res) => {
    const locations = await Location.find();
    res.json(locations);
};

export const createLocation = async (req, res) => {
    const location = new Location(req.body);
    await location.save();
    res.status(201).json({ message: 'Location created', location });
};

export const updateLocation = async (req, res) => {
    const updated = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Location updated', updated });
};

export const deleteLocation = async (req, res) => {
    await Location.findByIdAndDelete(req.params.id);
    res.json({ message: 'Location deleted' });
};

export const getAllAssignedInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find({ status: "responded" })
            .populate('client', 'email')
            .sort({ createdAt: -1 });

        res.json(inquiries);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch leads', error: err.message });
    }
};
export const getAllPendingInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find({ status: "new" })
            .populate('client', 'email')
            .sort({ createdAt: -1 });

        res.json(inquiries);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch leads', error: err.message });
    }
};