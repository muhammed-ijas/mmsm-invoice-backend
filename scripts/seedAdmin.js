const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);  // ← ADD THIS AT THE TOP

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000  // ← ADD THIS TOO
    });
    console.log('✅ MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@invoice.com' });
    
    if (existingAdmin) {
      console.log('❌ Admin user already exists!');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      email: 'admin@invoice.com',
      password: 'admin123',
      name: 'Admin',
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@invoice.com');
    console.log('🔑 Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedAdmin();