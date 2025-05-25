import mongoose from 'mongoose';

const portfolioItemSchema = new mongoose.Schema({
  url: { type: String, required: true },
  description: { type: String, default: '' },
  index: { type: Number, required: true },
}, { timestamps: true });

const partnerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  personalDetails: {
    name: String,
    phone: String,
    email: String,
  },
  serviceDetails: {
    category: String,
    experience: String,
    description: String,
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
  }],
  document: {
    aadharNumber: String,
  },
  portfolio: [portfolioItemSchema],
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  enquiries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inquiry',
  }],
  comment: String,
}, { timestamps: true });

export default mongoose.model('Partner', partnerSchema);
