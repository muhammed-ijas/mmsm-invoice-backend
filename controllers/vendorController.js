const Vendor = require('../models/Vendor');

// @desc    Get all vendors
// @route   GET /api/vendors
exports.getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    res.json(vendors);
  } catch (error) {
    console.error('Error getting vendors:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new vendor
// @route   POST /api/vendors
exports.createVendor = async (req, res) => {
  try {
    const vendor = new Vendor(req.body);
    const newVendor = await vendor.save();
    res.status(201).json(newVendor);
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update vendor
// @route   PUT /api/vendors/:id
exports.updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    await Vendor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ message: error.message });
  }
};