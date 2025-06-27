# BanhDaKe Backend API

A Node.js/Express backend server for the BanhDaKe shoe store, connected to MongoDB.

## Features

- RESTful API for products and orders
- MongoDB integration with Mongoose
- Input validation with express-validator
- CORS enabled for frontend integration
- Automatic stock management
- Order status tracking

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start MongoDB (make sure MongoDB is running on `mongodb://localhost:27017/`)

3. Seed the database with sample data:
```bash
npm run seed
```

4. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## API Endpoints

### Products

#### GET /api/products
Get all products with pagination and optional filtering
- Query parameters:
  - `page` (default: 1)
  - `limit` (default: 10)
  - `search` (text search)
  - `inStock` (true/false)

#### GET /api/products/:id
Get a single product by ID

#### POST /api/products
Create a new product
- Required fields: `name`, `price`, `image`, `shortDescription`, `detailDescription`, `sizes`, `stock`

#### PUT /api/products/:id
Update an existing product

#### DELETE /api/products/:id
Delete a product

#### PATCH /api/products/:id/stock
Update product stock
- Body: `{ "stock": number }`

### Orders

#### GET /api/orders
Get all orders with pagination and optional filtering
- Query parameters:
  - `page` (default: 1)
  - `limit` (default: 10)
  - `status` (Pending/Shipped/Completed)
  - `email` (customer email)

#### GET /api/orders/:id
Get a single order by ID

#### POST /api/orders
Create a new order
- Required fields: `products`, `customerInfo`
- Automatically calculates total and updates product stock

#### PUT /api/orders/:id/status
Update order status
- Body: `{ "status": "Pending" | "Shipped" | "Completed" }`

#### DELETE /api/orders/:id
Delete an order (only if status is Pending)

#### GET /api/orders/stats/summary
Get order statistics summary

### Health Check

#### GET /api/health
Check if the server is running

## Data Models

### Product
```typescript
{
  name: string,
  price: number,
  image: string,
  images: string[],
  shortDescription: string,
  detailDescription: string,
  sizes: string[],
  specifications: Record<string, string>,
  inStock: boolean,
  stock: number,
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```typescript
{
  products: OrderItem[],
  total: number,
  customerInfo: CustomerInfo,
  status: "Pending" | "Shipped" | "Completed",
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables

Create a `.env` file in the root directory:

```
MONGODB_URI=mongodb://localhost:27017/BanhDaKe
PORT=5000
NODE_ENV=development
```

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run seed` - Seed the database with sample data

## Database

The application connects to MongoDB at `mongodb://localhost:27017/BanhDaKe`

Make sure MongoDB is installed and running before starting the server.

## CORS

CORS is enabled for all origins in development. For production, you should configure specific allowed origins.
