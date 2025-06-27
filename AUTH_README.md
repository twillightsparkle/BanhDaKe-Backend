# Authentication System Documentation

## Overview
The BanhDaKe Shop backend now includes a robust authentication system that protects admin-only operations while keeping user-facing features (like creating orders) publicly accessible.

## Features
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (Admin only)
- Protected routes for product and order management
- Public order creation for customers

## Setup

### 1. Environment Variables
Create a `.env` file in the backend root directory:
```env
MONGODB_URI=mongodb://localhost:27017/BanhDaKe
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 2. Create Default Admin
Run the following command to create the default admin account:
```bash
npm run create-admin
```

**Default Admin Credentials:**
- Username: `admin`
- Email: `admin@banhdake.com`
- Password: `admin123`

⚠️ **Important:** Change the default password after first login!

## API Endpoints

### Authentication Routes

#### POST /api/auth/login
Login with admin credentials.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "admin": {
    "id": "admin-id",
    "username": "admin",
    "email": "admin@banhdake.com",
    "role": "admin"
  }
}
```

#### POST /api/auth/register
Create a new admin account.

**Request Body:**
```json
{
  "username": "newadmin",
  "email": "newadmin@banhdake.com",
  "password": "securepassword"
}
```

#### GET /api/auth/verify
Verify JWT token validity.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

### Protected Routes (Admin Only)

The following routes require authentication:

#### Products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product  
- `DELETE /api/products/:id` - Delete product

#### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order (only pending orders)

### Public Routes

These routes remain publicly accessible:

#### Products (Read-only)
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product

#### Orders (Create only)
- `POST /api/orders` - Create new order (for customers)

## Authentication Usage

### For Frontend Applications

1. **Login Process:**
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
});

const data = await response.json();
if (data.token) {
  // Store token in localStorage or secure storage
  localStorage.setItem('adminToken', data.token);
}
```

2. **Making Authenticated Requests:**
```javascript
const token = localStorage.getItem('adminToken');

const response = await fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(productData)
});
```

### For Postman/API Testing

Add the following header to protected requests:
```
Authorization: Bearer <your-jwt-token>
```

## Security Features

1. **Password Hashing:** All passwords are hashed using bcrypt before storage
2. **JWT Tokens:** Secure token-based authentication with configurable expiration
3. **Role-based Access:** Only admin role can access protected routes
4. **Input Validation:** All inputs are validated using express-validator
5. **Error Handling:** Proper error responses for authentication failures

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "error": "Access denied. Admin privileges required."
}
```

### 400 Bad Request
```json
{
  "errors": [
    {
      "msg": "Password must be at least 6 characters",
      "param": "password"
    }
  ]
}
```

## Database Schema

### Admin Model
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['admin'], default: 'admin'),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

## Development Commands

```bash
# Start server
npm start

# Start with nodemon (development)
npm run dev

# Create default admin
npm run create-admin

# Seed products (if available)
npm run seed
```

## Production Considerations

1. **Change JWT Secret:** Use a strong, unique JWT secret in production
2. **Environment Variables:** Never commit sensitive data to version control
3. **HTTPS:** Always use HTTPS in production for secure token transmission
4. **Token Expiration:** Consider implementing refresh tokens for longer sessions
5. **Rate Limiting:** Add rate limiting to prevent brute force attacks
6. **Admin Account:** Change default admin credentials immediately after deployment
