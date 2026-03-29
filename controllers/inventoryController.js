const Inventory = require('../models/Inventory');

// @desc    Get all inventory items
// @route   GET /api/inventory
exports.getInventory = async (req, res) => {
  try {
    const items = await Inventory.find()
      .populate('vendorId', 'name accountNo phone')
      .populate('productId', 'name partNumber')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('Error getting inventory:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new inventory item
// @route   POST /api/inventory
exports.createInventoryItem = async (req, res) => {
  try {
    const item = new Inventory(req.body);
    const newItem = await item.save();
    const populated = await newItem.populate('vendorId', 'name accountNo phone');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
exports.updateInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('vendorId', 'name accountNo phone');

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
exports.deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Adjust stock quantity
// @route   PATCH /api/inventory/:id/stock
exports.adjustStock = async (req, res) => {
  try {
    const { adjustment, type } = req.body;
    // type: 'add' or 'subtract'
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    if (type === 'add') {
      item.quantityInStock += Number(adjustment);
    } else if (type === 'subtract') {
      if (item.quantityInStock < Number(adjustment)) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
      item.quantityInStock -= Number(adjustment);
    }

    await item.save();
    res.json({ message: 'Stock updated successfully', item });
  } catch (error) {
    console.error('Error adjusting stock:', error);
    res.status(500).json({ message: error.message });
  }
};