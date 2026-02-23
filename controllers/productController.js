  const Product = require('../models/Product');
  const Invoice = require('../models/Invoice');

  // @desc    Get all products
  // @route   GET /api/products
  // @access  Private
  exports.getProducts = async (req, res) => {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      res.json(products);
    } catch (error) {
      console.error('Error getting products:', error);
      res.status(500).json({ message: error.message });
    }
  };

  // @desc    Create new product
  // @route   POST /api/products
  // @access  Private
  exports.createProduct = async (req, res) => {
    try {
      const product = new Product(req.body);
      const newProduct = await product.save();
      res.status(201).json(newProduct);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(400).json({ message: error.message });
    }
  };

  // @desc    Update product
  // @route   PUT /api/products/:id
  // @access  Private
  exports.updateProduct = async (req, res) => {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json(product);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(400).json({ message: error.message });
    }
  };

  // @desc    Delete product
  // @route   DELETE /api/products/:id
  // @access  Private

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is used in any invoice
    const invoiceWithProduct = await Invoice.findOne({ 
      'items.productId': req.params.id
    });
    
    // ✅ ALLOW deletion but warn user
    if (invoiceWithProduct) {
      await Product.findByIdAndDelete(req.params.id);
      return res.json({ 
        message: 'Product deleted. Historical invoice data is preserved.',
        warning: 'This product was used in invoices. Invoice history remains unchanged.'
      });
    }

    // No invoices - safe to delete
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: error.message });
  }
};