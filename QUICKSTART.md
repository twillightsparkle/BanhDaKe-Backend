# Quick Start Guide

## Prerequisites
1. Node.js installed
2. MongoDB installed and running on `mongodb://localhost:27017/`

## Setup Steps

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Start MongoDB**:
   Make sure MongoDB service is running on your system.

3. **Seed the database**:
   ```bash
   npm run seed
   ```

4. **Start the server**:
   ```bash
   npm run dev
   ```

5. **Test the API**:
   Open your browser or use a tool like Postman to test:
   - GET `http://localhost:5000/api/health` - Should return server status
   - GET `http://localhost:5000/api/products` - Should return the seeded products
   - GET `http://localhost:5000/api/orders` - Should return the seeded orders

## Sample API Calls

### Get all products:
```bash
curl http://localhost:5000/api/products
```

### Create a new product:
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Balance 574",
    "price": 2000000,
    "image": "/src/assets/shoe5.jpg",
    "images": ["/src/assets/shoe5.jpg"],
    "shortDescription": "Giày thể thao New Balance 574 retro",
    "detailDescription": "New Balance 574 với thiết kế retro và công nghệ đệm hiện đại",
    "sizes": ["38", "39", "40", "41", "42"],
    "specifications": {
      "Chất liệu upper": "Suede và mesh",
      "Chất liệu đế": "EVA"
    },
    "stock": 15
  }'
```

### Create a new order:
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {
        "productId": "PRODUCT_ID_HERE",
        "quantity": 1
      }
    ],
    "customerInfo": {
      "name": "Test Customer",
      "email": "test@example.com",
      "address": "123 Test Street"
    }
  }'
```

## Troubleshooting

- **MongoDB connection error**: Make sure MongoDB is running
- **Port already in use**: Change the PORT in `.env` file
- **Module not found**: Run `npm install` again
