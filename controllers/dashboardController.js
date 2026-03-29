const Invoice  = require('../models/Invoice');
const Customer = require('../models/Customer');
const Product  = require('../models/Product');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
  try {
    // ── Document counts ────────────────────────────────────────────────────
    const [
      totalInvoices,
      totalQuotations,
      totalProforma,
      totalPurchases,
      totalCustomers,
      totalProducts,
    ] = await Promise.all([
      Invoice.countDocuments({ documentType: 'invoice'   }),
      Invoice.countDocuments({ documentType: 'quotation' }),
      Invoice.countDocuments({ documentType: 'proforma'  }),
      Invoice.countDocuments({ documentType: 'purchase'  }),
      Customer.countDocuments(),
      Product.countDocuments(),
    ]);

    // ── Financial totals ───────────────────────────────────────────────────
    const salesAgg = await Invoice.aggregate([
      { $match: { documentType: 'invoice' } },
      { $group: {
          _id: null,
          totalSalesAmount: { $sum: '$grandTotal' },
          totalSalesVAT:    { $sum: '$vatAmount'  },
      }},
    ]);

    const purchaseAgg = await Invoice.aggregate([
      { $match: { documentType: 'purchase' } },
      { $group: {
          _id: null,
          totalPurchaseAmount: { $sum: '$grandTotal' },
          totalPurchaseVAT:    { $sum: '$vatAmount'  },
      }},
    ]);

    const totalSalesAmount   = salesAgg[0]?.totalSalesAmount   || 0;
    const totalSalesVAT      = salesAgg[0]?.totalSalesVAT      || 0;
    const totalPurchaseAmount = purchaseAgg[0]?.totalPurchaseAmount || 0;
    const totalPurchaseVAT   = purchaseAgg[0]?.totalPurchaseVAT   || 0;
    const vatDifference      = totalSalesVAT - totalPurchaseVAT;

    // ── Customers list for statements ──────────────────────────────────────
    const customers = await Customer.find().sort({ name: 1 }).select('name accountNo vatNumber phone');

    res.json({
      financials: {
        totalSalesAmount:    totalSalesAmount.toFixed(2),
        totalSalesVAT:       totalSalesVAT.toFixed(2),
        totalPurchaseAmount: totalPurchaseAmount.toFixed(2),
        totalPurchaseVAT:    totalPurchaseVAT.toFixed(2),
        vatDifference:       vatDifference.toFixed(2),
      },
      documents: {
        totalInvoices,
        totalQuotations,
        totalProforma,
        totalPurchases,
      },
      masters: {
        totalCustomers,
        totalProducts,
      },
      customers, // for the statements row
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: error.message });
  }
};