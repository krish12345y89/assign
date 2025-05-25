import Inquiry from '../models/Inquiry.js';
import Partner from '../models/Partner.js';
import User from '../models/User.js';

export const createInquiry = async (req, res) => {
  try {
    const { category, date, budget, city, referenceImage } = req.body;

    const partners = await User.find({
      role: 'partner',
      'profile.city': city,
    });

    const assignedPartnerIds = partners.map(p => p._id);

    const inquiry = await Inquiry.create({
      client: req.user._id,
      category,
      date,
      budget,
      city,
      referenceImage,
      assignedPartners: assignedPartnerIds,
    });

    res.status(201).json({ message: 'Inquiry created', inquiry });
  } catch (err) {
    res.status(500).json({ message: 'Error creating inquiry', error: err.message });
  }
};

export const getAssignedInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ assignedPartners: { $in: [req.user._id] } })
      .populate('client', 'email')
      .sort({ createdAt: -1 });

    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leads', error: err.message });
  }
};

export const updateInquiryStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['new', 'responded', 'booked', 'closed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const inquiry = await Inquiry.findById(id);
  if (!inquiry || !inquiry.assignedPartners.includes(req.user._id)) {
    return res.status(404).json({ message: 'Inquiry not found or not assigned to you' });
  }

  inquiry.status = status;
  await inquiry.save();
  res.json({ message: 'Status updated', inquiry });
};

export const getClientInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ client: req.user._id });
    res.json({ inquiries });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching inquiries', error: err.message });
  }
};

export const getClientInquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const inquiry = await Inquiry.findOne({ _id: id, client: req.user._id });
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    res.json({ inquiry });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching inquiry', error: err.message });
  }
};

export const updateClientInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const inquiry = await Inquiry.findOneAndUpdate(
      { _id: id, client: req.user._id },
      req.body,
      { new: true }
    );
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found or unauthorized' });
    res.json({ message: 'Inquiry updated', inquiry });
  } catch (err) {
    res.status(500).json({ message: 'Error updating inquiry', error: err.message });
  }
};

export const deleteClientInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const inquiry = await Inquiry.findOneAndDelete({ _id: id, client: req.user._id });
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found or unauthorized' });
    const enquiry = Partner.findOne({ enquiries: { $in: [id] } })
    if (enquiry) {
      await Partner.updateMany(
        { enquiries: { $in: [id] } },
        { $pull: { enquiries: id } }
      );
    }
    res.json({ message: 'Inquiry deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting inquiry', error: err.message });
  }
};
