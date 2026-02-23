const Company = require('../models/Company');

// @desc    Get company settings
// @route   GET /api/company
// @access  Private
exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findOne();
    res.json(company);
  } catch (error) {
    console.error('Error getting company:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update company settings
// @route   POST /api/company
// @access  Private
exports.saveCompany = async (req, res) => {
  try {
    let company = await Company.findOne();
    
    if (company) {
      // Update existing
      Object.assign(company, req.body);
      await company.save();
    } else {
      // Create new
      company = new Company(req.body);
      await company.save();
    }
    
    res.json(company);
  } catch (error) {
    console.error('Error saving company:', error);
    res.status(400).json({ message: error.message });
  }
};