

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    console.error('Please check:');
    console.error('1. MONGO_URI in .env file');
    console.error('2. Network Access settings in MongoDB Atlas');
    console.error('3. Database user credentials');
    process.exit(1);
  }
};

connectDB();

// Import Routes
const authRoutes = require('./routes/auth');        
const companyRoutes = require('./routes/company');
const customerRoutes = require('./routes/customers');
const productRoutes = require('./routes/products');
const invoiceRoutes = require('./routes/invoices');
const dashboardRoutes = require('./routes/dashboard');
const vendorRoutes = require('./routes/vendors');
const inventoryRoutes = require('./routes/inventory');

// Use Routes
app.use('/api/auth', authRoutes);   
app.use('/api/dashboard', dashboardRoutes);               
app.use('/api/company', companyRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/inventory', inventoryRoutes);

// Root Route
app.get('/', (req, res) => {
  res.send('Invoice API Running ✅');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});