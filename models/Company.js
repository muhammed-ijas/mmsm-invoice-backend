const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name_en: { type: String, required: true },
  name_ar: { type: String, required: true },
  businessActivity: String,
  logo: { type: String, default: '/logo.png' },  // ← DEFAULT VALUE
  vatNumber: { type: String, required: true },
  crNumber: { type: String, required: true },
  vatEffectiveDate: Date,
  taxPeriod: { type: String, default: 'Quarterly' },
  mobile: { type: String },
  telephone: String,
  email: String,
  address: {
    buildingNo: String,
    streetName: String,
    district: String,
    city: String,
    postalCode: String,
    country: { type: String, default: 'Saudi Arabia' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
