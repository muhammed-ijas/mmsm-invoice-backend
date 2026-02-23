# MongoDB Connection Troubleshooting Guide

## Current Issue
Your server is failing to connect to MongoDB Atlas with error:
```
Error: querySrv ECONNREFUSED _mongodb._tcp.invoice-cluster.p11gtyv.mongodb.net
```

This is a **DNS resolution error** that typically indicates MongoDB Atlas Network Access issues.

## Solution Steps (Try in Order)

### 1. ✅ **Add Your IP to MongoDB Atlas Network Access** (MOST LIKELY FIX)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log in to your account
3. Select your project
4. Click **"Network Access"** in the left sidebar (under Security)
5. Click **"Add IP Address"**
6. Choose one of these options:
   - **Quick Fix**: Click "Allow Access from Anywhere" (0.0.0.0/0)
     - ⚠️ Not recommended for production, but good for testing
   - **Secure Fix**: Click "Add Current IP Address"
     - This adds only your current IP
7. Click **"Confirm"**
8. Wait 1-2 minutes for the changes to propagate

### 2. 🔐 **Verify Database User Credentials**

1. In MongoDB Atlas, go to **"Database Access"** (under Security)
2. Verify the user `muhammedijas793_db_user` exists
3. If needed, create a new user:
   - Click "Add New Database User"
   - Username: `muhammedijas793_db_user`
   - Password: `GylADCKbCJR0bott` (or create a new one)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

### 3. 🌐 **Check Your Network**

- Disable VPN if you're using one
- Try a different network (mobile hotspot, different WiFi)
- Check if your firewall is blocking MongoDB (port 27017)
- Some corporate/school networks block MongoDB Atlas

### 4. 🔄 **Get a Fresh Connection String**

1. In MongoDB Atlas, go to **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Update your `.env` file with the new URI

## Testing the Connection

After making changes, run:
```bash
node test-connection.js
```

If successful, restart your server:
```bash
npm run dev
```

## Alternative: Use Standard Connection String (Not SRV)

If DNS issues persist, you can try using a standard connection string instead of `mongodb+srv://`:

1. In MongoDB Atlas, when getting your connection string, look for the "Standard connection string" option
2. It will look like: `mongodb://host1:27017,host2:27017,host3:27017/...`
3. Update your `.env` file with this format

## Still Not Working?

If none of the above works:
1. Check MongoDB Atlas status: https://status.cloud.mongodb.com/
2. Try creating a new cluster
3. Contact MongoDB Atlas support
