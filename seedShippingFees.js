import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ShippingFee from './models/ShippingFee.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/BanhDaKe';

const shippingFeesData = [
  { country: 'US', baseFee: 25, perKgRate: 5, isActive: true },
  { country: 'CN', baseFee: 15, perKgRate: 2.5, isActive: true },
  { country: 'JP', baseFee: 20, perKgRate: 3, isActive: true },
  { country: 'KR', baseFee: 18, perKgRate: 3.5, isActive: true },
  { country: 'TH', baseFee: 12, perKgRate: 2, isActive: true },
  { country: 'SG', baseFee: 15, perKgRate: 2.8, isActive: true },
  { country: 'AU', baseFee: 30, perKgRate: 4.5, isActive: true },
  { country: 'GB', baseFee: 28, perKgRate: 4.2, isActive: true },
  { country: 'DE', baseFee: 25, perKgRate: 4, isActive: true },
  { country: 'CA', baseFee: 22, perKgRate: 4.8, isActive: true }
];

async function seedShippingFees() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing existing shipping fees...');
    await ShippingFee.deleteMany({});

    console.log('Seeding shipping fees...');
    const shippingFees = await ShippingFee.insertMany(shippingFeesData);
    
    console.log(`Successfully seeded ${shippingFees.length} shipping fees:`);
    shippingFees.forEach(fee => {
      console.log(`- ${fee.country}: $${fee.baseFee} + $${fee.perKgRate}/kg`);
    });

    console.log('\nShipping fee seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding shipping fees:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
seedShippingFees();
