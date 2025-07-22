import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Order from './models/Order.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/BanhDaKe';

const sampleProducts = [
  {
    name: {
      en: 'Vans Old Skool',
      vi: 'Vans Old Skool'
    },
    price: 1800000,
    image: '/src/assets/shoe1.jpg',
    images: ['/src/assets/shoe1.jpg', '/src/assets/shoe2.jpg'],
    shortDescription: {
      en: 'Classic Vans Old Skool skate shoes with signature side stripe',
      vi: 'Giày skate Vans Old Skool classic với sọc side stripe đặc trưng'
    },
    detailDescription: {
      en: 'Vans Old Skool is an icon of skate culture and street style. With its classic design, durable canvas material and waffle grip rubber sole, this is the perfect choice for those who love retro and comfortable style.',
      vi: 'Vans Old Skool là biểu tượng của văn hóa skate và street style. Với thiết kế cổ điển, chất liệu canvas bền bỉ và đế cao su waffle grip, đây là lựa chọn hoàn hảo cho những ai yêu thích phong cách retro và thoải mái.'
    },
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    specifications: [
      {
        key: { en: 'Upper Material', vi: 'Chất liệu upper' },
        value: { en: 'Canvas and suede', vi: 'Canvas và suede' }
      },
      {
        key: { en: 'Sole Material', vi: 'Chất liệu đế' },
        value: { en: 'Vulcanized rubber', vi: 'Vulcanized rubber' }
      },
      {
        key: { en: 'Technology', vi: 'Công nghệ' },
        value: { en: 'Waffle outsole', vi: 'Waffle outsole' }
      },
      {
        key: { en: 'Style', vi: 'Kiểu dáng' },
        value: { en: 'Low-top', vi: 'Low-top' }
      },
      {
        key: { en: 'Suitable for', vi: 'Phù hợp' },
        value: { en: 'Skate, casual, street style', vi: 'Skate, casual, street style' }
      },
      {
        key: { en: 'Origin', vi: 'Xuất xứ' },
        value: { en: 'China', vi: 'China' }
      }
    ],
    inStock: true,
    stock: 25
  },
  {
    name: {
      en: 'Nike Air Force 1',
      vi: 'Nike Air Force 1'
    },
    price: 2200000,
    image: '/src/assets/shoe2.jpg',
    images: ['/src/assets/shoe2.jpg', '/src/assets/shoe1.jpg'],
    shortDescription: {
      en: 'Classic Nike Air Force 1 sneakers with iconic design',
      vi: 'Giày thể thao Nike Air Force 1 classic với thiết kế iconic'
    },
    detailDescription: {
      en: 'Nike Air Force 1 is one of the most beloved sneakers of all time. With its clean, simple yet fashionable design, this shoe suits all styles from casual to streetwear.',
      vi: 'Nike Air Force 1 là một trong những mẫu giày thể thao được yêu thích nhất mọi thời đại. Với thiết kế clean, đơn giản nhưng không kém phần thời trang, đôi giày này phù hợp với mọi phong cách từ casual đến streetwear.'
    },
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
    specifications: [
      {
        key: { en: 'Upper Material', vi: 'Chất liệu upper' },
        value: { en: 'Leather', vi: 'Leather' }
      },
      {
        key: { en: 'Sole Material', vi: 'Chất liệu đế' },
        value: { en: 'Rubber', vi: 'Rubber' }
      },
      {
        key: { en: 'Technology', vi: 'Công nghệ' },
        value: { en: 'Nike Air', vi: 'Nike Air' }
      },
      {
        key: { en: 'Style', vi: 'Kiểu dáng' },
        value: { en: 'Low-top', vi: 'Low-top' }
      },
      {
        key: { en: 'Suitable for', vi: 'Phù hợp' },
        value: { en: 'Basketball, casual, street style', vi: 'Basketball, casual, street style' }
      },
      {
        key: { en: 'Origin', vi: 'Xuất xứ' },
        value: { en: 'Vietnam', vi: 'Vietnam' }
      }
    ],
    inStock: true,
    stock: 30
  },
  {
    name: {
      en: 'Adidas Stan Smith',
      vi: 'Adidas Stan Smith'
    },
    price: 1900000,
    image: '/src/assets/shoe3.jpg',
    images: ['/src/assets/shoe3.jpg', '/src/assets/shoe4.jpg'],
    shortDescription: {
      en: 'Minimalist and elegant Adidas Stan Smith tennis shoes',
      vi: 'Giày tennis Adidas Stan Smith minimalist và thanh lịch'
    },
    detailDescription: {
      en: 'Adidas Stan Smith is a symbol of simplicity and sophistication. With its minimalist design, premium leather material and pristine white color, this shoe easily pairs with any outfit.',
      vi: 'Adidas Stan Smith là biểu tượng của sự đơn giản và tinh tế. Với thiết kế minimalist, chất liệu da cao cấp và màu trắng tinh khôi, đôi giày này dễ dàng phối hợp với mọi trang phục.'
    },
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    specifications: [
      {
        key: { en: 'Upper Material', vi: 'Chất liệu upper' },
        value: { en: 'Full grain leather', vi: 'Full grain leather' }
      },
      {
        key: { en: 'Sole Material', vi: 'Chất liệu đế' },
        value: { en: 'Rubber', vi: 'Rubber' }
      },
      {
        key: { en: 'Technology', vi: 'Công nghệ' },
        value: { en: 'OrthoLite sockliner', vi: 'OrthoLite sockliner' }
      },
      {
        key: { en: 'Style', vi: 'Kiểu dáng' },
        value: { en: 'Low-top', vi: 'Low-top' }
      },
      {
        key: { en: 'Suitable for', vi: 'Phù hợp' },
        value: { en: 'Tennis, casual, minimalist style', vi: 'Tennis, casual, minimalist style' }
      },
      {
        key: { en: 'Origin', vi: 'Xuất xứ' },
        value: { en: 'Vietnam', vi: 'Vietnam' }
      }
    ],
    inStock: true,
    stock: 20
  },
  {
    name: {
      en: 'Converse Chuck Taylor All Star',
      vi: 'Converse Chuck Taylor All Star'
    },
    price: 1500000,
    image: '/src/assets/shoe4.jpg',
    images: ['/src/assets/shoe4.jpg', '/src/assets/shoe1.jpg'],
    shortDescription: {
      en: 'Vintage and distinctive Converse Chuck Taylor All Star canvas shoes',
      vi: 'Giày canvas Converse Chuck Taylor All Star vintage và cá tính'
    },
    detailDescription: {
      en: 'Converse Chuck Taylor All Star is a legendary canvas shoe with over 100 years of history. The distinctive high-top design, breathable canvas material and vintage style create a timeless appeal.',
      vi: 'Converse Chuck Taylor All Star là đôi giày canvas huyền thoại với lịch sử hơn 100 năm. Thiết kế high-top đặc trưng, chất liệu canvas thoáng khí và phong cách vintage làm nên sức hút vượt thời gian.'
    },
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43'],
    specifications: [
      {
        key: { en: 'Upper Material', vi: 'Chất liệu upper' },
        value: { en: 'Canvas', vi: 'Canvas' }
      },
      {
        key: { en: 'Sole Material', vi: 'Chất liệu đế' },
        value: { en: 'Vulcanized rubber', vi: 'Vulcanized rubber' }
      },
      {
        key: { en: 'Technology', vi: 'Công nghệ' },
        value: { en: 'OrthoLite insole', vi: 'OrthoLite insole' }
      },
      {
        key: { en: 'Style', vi: 'Kiểu dáng' },
        value: { en: 'High-top', vi: 'High-top' }
      },
      {
        key: { en: 'Suitable for', vi: 'Phù hợp' },
        value: { en: 'Casual, vintage, street style', vi: 'Casual, vintage, street style' }
      },
      {
        key: { en: 'Origin', vi: 'Xuất xứ' },
        value: { en: 'Vietnam', vi: 'Vietnam' }
      }
    ],
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
