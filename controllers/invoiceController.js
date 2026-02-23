const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');

// @desc    Get all invoices with filtering
// @route   GET /api/invoices?documentType=invoice
// @access  Private
exports.getInvoices = async (req, res) => {
  try {
    const { documentType } = req.query;
    
    // ✅ Build filter query
    const filter = {};
    if (documentType) {
      filter.documentType = documentType;
    }

    const invoices = await Invoice.find(filter)
      .populate('customerId')
      .sort({ createdAt: -1 });
      
    res.json(invoices);
  } catch (error) {
    console.error('Error getting invoices:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('customerId');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.json(invoice);
  } catch (error) {
    console.error('Error getting invoice:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new invoice/quotation/proforma/purchase
// @route   POST /api/invoices
// @access  Private
exports.createInvoice = async (req, res) => {
  try {
    // Get customer data to create snapshot
    const customer = await Customer.findById(req.body.customerId);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // ✅ Create document with customer snapshot
    const invoiceData = {
      ...req.body,
      documentType: req.body.documentType || 'invoice', // ✅ Default to invoice
      customerSnapshot: {
        name: customer.name,
        vatNumber: customer.vatNumber,
        accountNo: customer.accountNo,
        phone: customer.phone,
        address: customer.address
      }
    };

    const invoice = new Invoice(invoiceData);
    const newInvoice = await invoice.save();
    
    // Populate before sending response
    await newInvoice.populate('customerId');
    
    res.status(201).json(newInvoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ NEW: Get sales report (invoices only)
// @route   GET /api/invoices/reports/sales
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter = { documentType: 'invoice' };
    if (startDate && endDate) {
      filter.invoiceDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const invoices = await Invoice.find(filter)
      .populate('customerId')
      .sort({ invoiceDate: -1 });

    const totalSales = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const totalVAT = invoices.reduce((sum, inv) => sum + inv.vatAmount, 0);

    res.json({
      invoices,
      summary: {
        totalInvoices: invoices.length,
        totalSales: totalSales.toFixed(2),
        totalVAT: totalVAT.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error getting sales report:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ NEW: Get purchase report
// @route   GET /api/invoices/reports/purchases
exports.getPurchaseReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter = { documentType: 'purchase' };
    if (startDate && endDate) {
      filter.invoiceDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const purchases = await Invoice.find(filter)
      .populate('customerId')
      .sort({ invoiceDate: -1 });

    const totalPurchases = purchases.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const totalVAT = purchases.reduce((sum, inv) => sum + inv.vatAmount, 0);

    res.json({
      purchases,
      summary: {
        totalPurchases: purchases.length,
        totalAmount: totalPurchases.toFixed(2),
        totalVAT: totalVAT.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error getting purchase report:', error);
    res.status(500).json({ message: error.message });
  }
};