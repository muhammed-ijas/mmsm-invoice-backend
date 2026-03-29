const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  vatNumber: { type: String },
  accountNo: { type: String, unique: true, sparse: true },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  contactPerson: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);