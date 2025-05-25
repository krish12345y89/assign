import Partner from '../models/Partner.js';

export const submitPartnerDetails = async (req, res) => {
  try {
    const { personalDetails, serviceDetails, document, portfolioUrls } = req.body;
    if (!req.body || !personalDetails || !serviceDetails || !document || !portfolioUrls) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existing = await Partner.findOne({ user: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already submitted' });

    const partner = await Partner.create({
      user: req.user._id,
      personalDetails,
      serviceDetails,
      document,
      portfolioUrls,
    });

    res.status(201).json({ message: 'Submission successful', partner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error submitting details', error: err.message });
  }
};

export const addPortfolioItem = async (req, res) => {
  const { url, description, index } = req.body;
  console.log(req.body);
  if (!url || !description || index === undefined) {
    return res.status(400).json({ message: 'URL, description, and index are required' });
  }
  try {
    const partner = await Partner.findOne({ user: req.user._id });
    console.log(req.user._id);
    console.log(partner);
    if (!partner) return res.status(404).json({ message: 'Partner not found' });
    const indexExists = partner.portfolio.some(item => item.index === index);
    if (indexExists) {
      return res.status(400).json({ message: 'Portfolio index must be unique' });
    }
    // Create the portfolio item and add it to the array
    const newPortfolioItem = { url, description, index };
    await partner.updateOne(
      { $push: { portfolio: newPortfolioItem } }, { new: true }
    )
    await partner.save();
    res.status(201).json({ message: 'Portfolio item added successfully', portfolio: partner.portfolio });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const editPortfolioItem = async (req, res) => {
  const { id } = req.params;
  const { url, description, index } = req.body;
  try {
    const partner = await Partner.findOne({ user: req.user._id });
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    const portfolioItem = partner.portfolio.id(id);
    if (!portfolioItem) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }
    const indexExists = partner.portfolio.some(item => item.index === index);
    if (indexExists) {
      return res.status(400).json({ message: 'Portfolio index must be unique' });
    }
    // Update the portfolio item
    portfolioItem.url = url || portfolioItem.url;
    portfolioItem.description = description || portfolioItem.description;
    portfolioItem.index = index || portfolioItem.index;

    await partner.save();
    res.status(200).json({ message: 'Portfolio item updated', portfolio: partner.portfolio });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deletePortfolioItem = async (req, res) => {
  console.log("entered");
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Portfolio item ID is required' });
  }

  try {
    console.log("entered try");
    const partner = await Partner.findOne({ user: req.user._id });
    if (!partner) return res.status(404).json({ message: 'Partner not found' });

    // ✅ Remove portfolio item by ID
    partner.portfolio = partner.portfolio.filter(item => item._id.toString() !== id);
    await partner.save();

    return res.status(200).json({
      message: 'Portfolio item deleted',
      portfolio: partner.portfolio,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const reorderPortfolioItems = async (req, res) => {
  const { reorderedPortfolio } = req.body; // Expect an array of objects with index
  try {
    const partner = await Partner.findById(req.user._id);
    if (!partner) return res.status(404).json({ message: 'Partner not found' });

    // Sort portfolio items by the new index order
    partner.portfolio = reorderedPortfolio.sort((a, b) => a.index - b.index);

    await partner.save();
    res.status(200).json({ message: 'Portfolio reordered successfully', portfolio: partner.portfolio });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllPortfolioItems = async (req, res) => {
  try {
    const partner = await Partner.findOne({ user: req.user._id });

    if (!partner) return res.status(404).json({ message: 'Partner not found' });

    return res.status(200).json({ portfolio: partner.portfolio });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getPortfolioItemById = async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ message: 'Portfolio item ID is required' });

  try {
    const partner = await Partner.findOne({ user: req.user._id });

    if (!partner) return res.status(404).json({ message: 'Partner not found' });

    const portfolioItem = partner.portfolio.find(item => item._id.toString() === id);

    if (!portfolioItem) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    return res.status(200).json({ portfolioItem });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
