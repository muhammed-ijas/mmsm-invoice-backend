const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoice,
  createInvoice,
  deleteInvoice,
  getSalesReport,      // ✅ NEW
  getPurchaseReport    // ✅ NEW
} = require('../controllers/invoiceController');

// ✅ Report routes MUST come before /:id route
router.get('/reports/sales', getSalesReport);
router.get('/reports/purchases', getPurchaseReport);

// Regular routes
router.get('/', getInvoices);
router.get('/:id', getInvoice);
router.post('/', createInvoice);
router.delete('/:id', deleteInvoice);

module.exports = router;