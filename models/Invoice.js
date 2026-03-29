const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    // ✅ ADD THIS NEW FIELD
    documentType: {
      type: String,
      enum: ["invoice", "quotation", "proforma", "purchase"],
      default: "invoice",
      required: true,
    },

    invoiceNumber: { type: String, required: true, unique: true },
    invoiceType: { type: String, enum: ["Cash", "Credit"], required: true },
    invoiceDate: { type: Date, required: true },
    dateOfSupply: { type: Date, required: true },

    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },

    customerSnapshot: {
      name: { type: String, required: true },
      vatNumber: String,
      accountNo: String,
      phone: String,
      address: String,
    },

    vendorSnapshot: {
      name: String,
      vatNumber: String,
      accountNo: String,
      phone: String,
      address: String,
      contactPerson: String,
    },

    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product",default: null  },
        inventoryId: {   // ✅ this field is completely missing from your schema
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      default: null
    },
        partNumber: String,
        productName: String,
        productName_ar: String,
        description: String,
        description_ar: String,
        quantity: { type: mongoose.Schema.Types.Mixed }, // Can be Number or "LS"
        unitPrice: Number,
        discount: { type: Number, default: 0 },
        vatPercent: Number,
        totalBeforeVAT: Number,
        vatAmount: Number,
        totalAfterVAT: Number,
      },
    ],

    partyMode: { type: String, enum: ["customer", "vendor"], default: "customer" },


    subtotal: { type: Number, required: true },
    discountTotal: { type: Number, default: 0 },
    vatAmount: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    amountInWords: String,
    qrCodeData: String,
    status: { type: String, enum: ["draft", "sent", "paid"], default: "draft" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Invoice", invoiceSchema);
