const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    name_ar: { type: String }, //  Arabic product name
    partNumber: { type: String, required: true, unique: true },
    description_en: { type: String, required: true },
    description_ar: String,//  Arabic product desc
    unitPrice: { type: Number, required: true },
    vatPercent: { type: Number, default: 15 },
    discount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
