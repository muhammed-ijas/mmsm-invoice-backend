const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB Connection...');
console.log('MONGO_URI:', process.env.MONGO_URI?.replace(/:[^:@]+@/, ':****@')); // Hide password

const testConnection = async () => {
    try {
        console.log('\n🔄 Attempting to connect...');

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        console.log('✅ MongoDB Connected Successfully!');
        console.log('Database:', mongoose.connection.db.databaseName);

        await mongoose.connection.close();
        console.log('✅ Connection closed');
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
        console.error('\nPossible solutions:');
        console.error('1. Check if your IP is whitelisted in MongoDB Atlas (Network Access)');
        console.error('2. Verify your username and password are correct');
        console.error('3. Try using a different network or disable VPN/Firewall');
        console.error('4. Check if MongoDB Atlas is accessible from your region');
        process.exit(1);
    }
};

testConnection();
