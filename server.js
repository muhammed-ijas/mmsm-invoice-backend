

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
const authRoutes = require('./routes/auth');         // ← NEW
const companyRoutes = require('./routes/company');
const customerRoutes = require('./routes/customers');
const productRoutes = require('./routes/products');
const invoiceRoutes = require('./routes/invoices');

// Use Routes
app.use('/api/auth', authRoutes);                    // ← NEW
app.use('/api/company', companyRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);

// Root Route
app.get('/', (req, res) => {
  res.send('Invoice API Running ✅');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});