import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Order from './models/Order.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/BanhDaKe';

const sampleProducts = [
  {
    name: 'Vans Old Skool',
    price: 1800000,
    image: '/src/assets/shoe1.jpg',
    images: ['/src/assets/shoe1.jpg', '/src/assets/shoe2.jpg'],
    shortDescription: 'Giày skate Vans Old Skool classic với sọc side stripe đặc trưng',
    detailDescription: 'Vans Old Skool là biểu tượng của văn hóa skate và street style. Với thiết kế cổ điển, chất liệu canvas bền bỉ và đế cao su waffle grip, đây là lựa chọn hoàn hảo cho những ai yêu thích phong cách retro và thoải mái.',
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    specifications: {
      'Chất liệu upper': 'Canvas và suede',
      'Chất liệu đế': 'Vulcanized rubber',
      'Công nghệ': 'Waffle outsole',
      'Kiểu dáng': 'Low-top',
      'Phù hợp': 'Skate, casual, street style',
      'Xuất xứ': 'China'
    },
    inStock: true,
    stock: 25
  },
  {
    name: 'Nike Air Force 1',
    price: 2200000,
    image: '/src/assets/shoe2.jpg',
    images: ['/src/assets/shoe2.jpg', '/src/assets/shoe1.jpg'],
    shortDescription: 'Giày thể thao Nike Air Force 1 classic với thiết kế iconic',
    detailDescription: 'Nike Air Force 1 là một trong những mẫu giày thể thao được yêu thích nhất mọi thời đại. Với thiết kế clean, đơn giản nhưng không kém phần thời trang, đôi giày này phù hợp với mọi phong cách từ casual đến streetwear.',
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
    specifications: {
      'Chất liệu upper': 'Leather',
      'Chất liệu đế': 'Rubber',
      'Công nghệ': 'Nike Air',
      'Kiểu dáng': 'Low-top',
      'Phù hợp': 'Basketball, casual, street style',
      'Xuất xứ': 'Vietnam'
    },
    inStock: true,
    stock: 30
  },
  {
    name: 'Adidas Stan Smith',
    price: 1900000,
    image: '/src/assets/shoe3.jpg',
    images: ['/src/assets/shoe3.jpg', '/src/assets/shoe4.jpg'],
    shortDescription: 'Giày tennis Adidas Stan Smith minimalist và thanh lịch',
    detailDescription: 'Adidas Stan Smith là biểu tượng của sự đơn giản và tinh tế. Với thiết kế minimalist, chất liệu da cao cấp và màu trắng tinh khôi, đôi giày này dễ dàng phối hợp với mọi trang phục.',
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    specifications: {
      'Chất liệu upper': 'Full grain leather',
      'Chất liệu đế': 'Rubber',
      'Công nghệ': 'OrthoLite sockliner',
      'Kiểu dáng': 'Low-top',
      'Phù hợp': 'Tennis, casual, minimalist style',
      'Xuất xứ': 'Vietnam'
    },
    inStock: true,
    stock: 20
  },
  {
    name: 'Converse Chuck Taylor All Star',
    price: 1500000,
    image: '/src/assets/shoe4.jpg',
    images: ['/src/assets/shoe4.jpg', '/src/assets/shoe1.jpg'],
    shortDescription: 'Giày canvas Converse Chuck Taylor All Star vintage và cá tính',
    detailDescription: 'Converse Chuck Taylor All Star là đôi giày canvas huyền thoại với lịch sử hơn 100 năm. Thiết kế high-top đặc trưng, chất liệu canvas thoáng khí và phong cách vintage làm nên sức hút vượt thời gian.',
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43'],
    specifications: {
      'Chất liệu upper': 'Canvas',
      'Chất liệu đế': 'Vulcanized rubber',
      'Công nghệ': 'OrthoLite insole',
      'Kiểu dáng': 'High-top',
      'Phù hợp': 'Casual, vintage, street style',
      'Xuất xứ': 'Vietnam'
    },
    inStock: true,
    stock: 35
  }
];

const sampleOrders = [
  {
    products: [
      {
        productName: 'Vans Old Skool',
        quantity: 2,
        price: 1800000
      }
    ],
    total: 3600000,
    customerInfo: {
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      phone: '0123456789',
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM'
    },
    status: 'Pending'
  },
  {
    products: [
      {
        productName: 'Nike Air Force 1',
        quantity: 1,
        price: 2200000
      },
      {
        productName: 'Adidas Stan Smith',
        quantity: 1,
        price: 1900000
      }
    ],
    total: 4100000,
    customerInfo: {
      name: 'Trần Thị B',
      email: 'tranthib@email.com',
      phone: '0987654321',
      address: '456 Lê Lợi, Quận 3, TP.HCM'
    },
    status: 'Shipped'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data');

    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${insertedProducts.length} products`);

    // Update sample orders with actual product IDs
    const updatedOrders = sampleOrders.map(order => ({
      ...order,
      products: order.products.map((item, index) => ({
        ...item,
        productId: insertedProducts[index]?._id || insertedProducts[0]._id
      }))
    }));

    // Insert sample orders
    const insertedOrders = await Order.insertMany(updatedOrders);
    console.log(`Inserted ${insertedOrders.length} orders`);

    console.log('Database seeded successfully!');
    console.log('\nSample data includes:');
    console.log('- 4 products (Vans, Nike, Adidas, Converse)');
    console.log('- 2 sample orders');
    console.log('\nYou can now test the API endpoints!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedDatabase();
