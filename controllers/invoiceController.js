const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');

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
    const { partyMode, customerId, vendorId } = req.body;

    // ✅ Sanitize items — convert empty string IDs to null
    const sanitizedItems = (req.body.items || []).map(item => ({
      ...item,
      productId: item.productId || null,
      inventoryId: item.inventoryId || null,
    }));

    let customerSnapshot = {};

    if (partyMode === "vendor" && vendorId) {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

      customerSnapshot = {
        name:          vendor.name,
        vatNumber:     vendor.vatNumber,
        accountNo:     vendor.accountNo,
        phone:         vendor.phone,
        address:       vendor.address,
        contactPerson: vendor.contactPerson,
      };

      const invoiceData = {
        ...req.body,
        items: sanitizedItems,
        documentType: req.body.documentType || 'invoice',
        customerId:   null,
        vendorId:     vendor._id,
        customerSnapshot,
        vendorSnapshot: customerSnapshot,
      };

      const invoice = new Invoice(invoiceData);
      const newInvoice = await invoice.save();
      await newInvoice.populate('vendorId');
      return res.status(201).json(newInvoice);

    } else {
      const customer = await Customer.findById(customerId);
      if (!customer) return res.status(404).json({ message: 'Customer not found' });

      customerSnapshot = {
        name:      customer.name,
        vatNumber: customer.vatNumber,
        accountNo: customer.accountNo,
        phone:     customer.phone,
        address:   customer.address,
      };

      const invoiceData = {
        ...req.body,
        items: sanitizedItems,
        documentType: req.body.documentType || 'invoice',
        vendorId: null,
        customerSnapshot,
      };

      const invoice = new Invoice(invoiceData);
      const newInvoice = await invoice.save();
      await newInvoice.populate('customerId');
      return res.status(201).json(newInvoice);
    }

  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(400).json({ message: error.message });
  }
};



// In invoiceController.js
exports.getNextDocumentNumber = async (req, res) => {
  try {
    const { type } = req.query;
    
    const prefixes = {
      invoice: 'INV',
      quotation: 'QUO',
      proforma: 'PRO',
      purchase: 'PUR'
    };

    const prefix = prefixes[type] || 'INV';
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const pattern = `${prefix}-${dateStr}-`;

    // Find the LAST invoice number with this prefix today
    const lastDoc = await Invoice.findOne({
      invoiceNumber: { $regex: `^${pattern}` }
    }).sort({ invoiceNumber: -1 });

    let nextNumber = '001';
    if (lastDoc) {
      const lastSeq = parseInt(lastDoc.invoiceNumber.split('-')[2]) || 0;
      nextNumber = (lastSeq + 1).toString().padStart(3, '0');
    }

    res.json({ number: `${prefix}-${dateStr}-${nextNumber}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
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





// In invoiceController.js
exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({ message: error.message });
  }
};


exports.getVATReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.invoiceDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Sales invoices
    const sales = await Invoice.find({ documentType: 'invoice', ...dateFilter });
    const totalSalesAmount = sales.reduce((s, i) => s + (i.grandTotal || 0), 0);
    const totalSalesVAT = sales.reduce((s, i) => s + (i.vatAmount || 0), 0);

    // Purchase invoices
    const purchases = await Invoice.find({ documentType: 'purchase', ...dateFilter });
    const totalPurchaseAmount = purchases.reduce((s, i) => s + (i.grandTotal || 0), 0);
    const totalPurchaseVAT = purchases.reduce((s, i) => s + (i.vatAmount || 0), 0);

    const vatDifference = totalSalesVAT - totalPurchaseVAT;

    res.json({
      sales: {
        count: sales.length,
        totalAmount: totalSalesAmount.toFixed(2),
        totalVAT: totalSalesVAT.toFixed(2),
      },
      purchases: {
        count: purchases.length,
        totalAmount: totalPurchaseAmount.toFixed(2),
        totalVAT: totalPurchaseVAT.toFixed(2),
      },
      vatDifference: vatDifference.toFixed(2),
      status: vatDifference >= 0 ? 'payable' : 'refundable',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};