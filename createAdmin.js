import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/BanhDaKe';

async function createDefaultAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Default admin already exists');
      return;
    }

    // Create default admin
    const defaultAdmin = new Admin({
      username: 'admin',
      email: 'admin@banhdake.com',
      password: 'admin123', // This will be hashed automatically
      role: 'admin'
    });

    await defaultAdmin.save();
    console.log('Default admin created successfully:');
    console.log('Username: admin');
    console.log('Email: admin@banhdake.com');
    console.log('Password: admin123');
    console.log('\nPlease change the default password after first login!');

  } catch (error) {
    console.error('Error creating default admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the script
createDefaultAdmin();
