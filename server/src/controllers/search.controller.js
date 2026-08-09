const Search = require('../models/Search');

// Fake vendor data until Dev 3's real Vendor model is ready
const mockVendors = [
  { _id: '000000000000000000000001', companyName: 'Lahore Textiles Co', country: 'Pakistan', industry: 'Textiles', rating: 4.5, certifications: ['BSCI'] },
  { _id: '000000000000000000000002', companyName: 'Karachi Cotton Mills', country: 'Pakistan', industry: 'Textiles', rating: 4.2, certifications: ['ISO 9001'] },
  { _id: '000000000000000000000003', companyName: 'Faisalabad Fabrics', country: 'Pakistan', industry: 'Textiles', rating: 4.7, certifications: ['ISO 9001', 'Oeko-Tex'] },
  { _id: '000000000000000000000004', companyName: 'Dhaka Garments Ltd', country: 'Bangladesh', industry: 'Textiles', rating: 4.0, certifications: ['BSCI', 'Oeko-Tex'] },
  { _id: '000000000000000000000005', companyName: 'Shenzhen Electronics', country: 'China', industry: 'Electronics', rating: 4.6, certifications: ['ISO 14001'] },
];

// Fake AI ranking function until Dev 6's real aiService.rank() is ready
function fakeAiRank(vendors, query) {
  return vendors.map(v => ({
    ...v,
    matchScore: Math.floor(Math.random() * 40) + 60, // random score 60-100
    rationale: `Good match based on ${v.industry.toLowerCase()} expertise and ${v.country} location.`
  })).sort((a, b) => b.matchScore - a.matchScore);
}

// POST /api/search/ai
exports.aiSearch = async (req, res) => {
  try {
    const { query, filters } = req.body;
    const buyerId = req.user.id;

    const trimmedQuery = (query || '').trim();

    if (trimmedQuery.length < 3 || trimmedQuery.length > 300) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Search query must be between 3 and 300 characters',
          fields: { query: 'Must be 3–300 characters' }
        }
      });
    }

    // Save this search to history
    await Search.create({ buyerId, query: trimmedQuery, filters: filters || {} });

    // Simple candidate filtering (plain DB-style query on mock data for now)
    let candidates = mockVendors;
    if (filters && filters.country) {
      candidates = candidates.filter(v => v.country === filters.country);
    }
    if (filters && filters.industry) {
      candidates = candidates.filter(v => v.industry === filters.industry);
    }
    if (filters && filters.certifications && filters.certifications.length > 0) {
      candidates = candidates.filter(v =>
        v.certifications && filters.certifications.every(cert => v.certifications.includes(cert))
      );
    }
    // MOQ/price/leadTime filters accepted but not yet applied —
    // mockVendors lacks these fields; will filter once Dev 3's real Vendor model lands

    let ranked;
    try {
      ranked = fakeAiRank(candidates, trimmedQuery);
    } catch (aiErr) {
      // Fallback: sort by rating if "AI" fails
      ranked = candidates.sort((a, b) => b.rating - a.rating);
    }

    res.json({ success: true, data: ranked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};

// GET /api/search/default — browse vendors without a search query (e-commerce style default view)
exports.getDefaultVendors = async (req, res) => {
  try {
    const { country, industry, certifications } = req.query;

    let candidates = mockVendors;
    if (country) {
      candidates = candidates.filter(v => v.country === country);
    }
    if (industry) {
      candidates = candidates.filter(v => v.industry === industry);
    }
    if (certifications) {
      const certList = certifications.split(',');
      candidates = candidates.filter(v =>
        v.certifications && certList.every(c => v.certifications.includes(c))
      );
    }

    const sorted = [...candidates].sort((a, b) => b.rating - a.rating);
    res.json({ success: true, data: sorted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};

// GET /api/search/history
exports.getSearchHistory = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const history = await Search.find({ buyerId }).sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, data: history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};

// GET /api/dashboard/buyer
exports.getBuyerDashboard = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const recentSearches = await Search.find({ buyerId }).sort({ createdAt: -1 }).limit(5);
    const Favorite = require('../models/Favorite');
    const savedVendorsCount = await Favorite.countDocuments({ buyerId });

    // Count searches made this calendar month (for the free-tier soft paywall)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const searchCountThisMonth = await Search.countDocuments({
      buyerId,
      createdAt: { $gte: startOfMonth }
    });

    res.json({
      success: true,
      data: {
        activeRfqs: 0,       // will connect to real RFQ data once Dev 4's module exists
        pendingQuotes: 0,    // same
        orders: 0,           // same
        savedVendors: savedVendorsCount,
        recentSearches,
        searchCountThisMonth,
        spendingSummary: 0   // placeholder until Orders module exists
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};