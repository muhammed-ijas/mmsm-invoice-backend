const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  vatNumber: { type: String }, // Optional
  accountNo: { type: String, unique: true, sparse: true }, // Optional but unique if provided
  phone: { type: String }, // Optional
  address: { type: String } // Optional
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);