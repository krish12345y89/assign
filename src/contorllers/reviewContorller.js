import Partner from '../models/Partner.js';
import Review from '../models/Review.js';

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('client', 'email')
      .populate('partner', 'email');
    res.json(reviews);
  } catch (error) {
    console.error('Fetch reviews error:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedReview = await Review.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedReview) return res.status(404).json({ message: 'Review not found' });

    res.json({ message: 'Review updated', review: updatedReview });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Failed to update review' });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Review.findByIdAndDelete(id);
    await Partner.updateMany(
      { reviews: { $in: [id] } },
      { $pull: { reviews: id } }
    );

    if (!deleted) return res.status(404).json({ message: 'Review not found' });

    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Failed to delete review' });
  }
};
export const createReview = async (req, res) => {
  try {
    const { partnerId, rating, comment } = req.body;
    if (!partnerId || !rating || !comment) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const part = await Partner.find({ user: partnerId });
    if (!part) {
      return res.status(404).json({ message: 'please provide a valid partner id' });
    }
    console.log('Creating review for partner:', part);
    // Check if user is client
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Only clients can leave reviews' });
    }
    // Prevent duplicate review
    const alreadyReviewed = await Review.findOne({
      client: req.user._id,
      partner: partnerId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this partner' });
    }

    const review = await Review.create({
      client: req.user._id,
      partner: partnerId,
      rating,
      comment,
    });
    const partner = await Partner.findOneAndUpdate({ user: partnerId }, {
      $push: { reviews: review._id },
    });
    res.status(201).json({ message: 'Review submitted', review });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Failed to submit review' });
  }
};

export const getPartnerReviews = async (req, res) => {
  try {
    const { partnerId } = req.params;

    const reviews = await Review.find({ partner: partnerId }).populate('client', 'email');

    const average =
      reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);

    res.json({ reviews, averageRating: average.toFixed(1) });
  } catch (error) {
    console.error('Get partner reviews error:', error);
    res.status(500).json({ message: 'Failed to get partner reviews' });
  }
};
