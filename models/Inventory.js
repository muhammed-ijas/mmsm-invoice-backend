const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null,
  },
  partNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  name_ar: { type: String },
  description: { type: String },
  category: { type: String },
  unit: { type: String, default: 'pcs' },
  quantityInStock: { type: Number, default: 0 },
  minimumStock: { type: Number, default: 0 },
  unitCost: { type: Number, default: 0 },
  unitPrice: { type: Number, default: 0 },
  location: { type: String },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);