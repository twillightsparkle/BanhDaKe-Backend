# Firebase User Authentication Integration

This document describes the Firebase user authentication integration for user order management in the BanhdakeShop.

## Setup

### Backend Configuration

1. Install Firebase Admin SDK:
   ```bash
   npm install firebase-admin
   ```

2. Set up Firebase authentication in your project:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication in the Firebase console
   - Set up authentication methods (Email/Password, Google, etc.)

3. Configure Firebase Admin SDK:
   - Option 1: Use Application Default Credentials (recommended for development)
   - Option 2: Use service account key (add to .env file):
     ```env
     FIREBASE_PROJECT_ID=your-firebase-project-id
     FIREBASE_CLIENT_EMAIL=your-firebase-client-email
     FIREBASE_PRIVATE_KEY=your-firebase-private-key
     ```

### Frontend Configuration

1. Make sure Firebase is configured in your React app
2. Users must be authenticated with Firebase to access order endpoints
3. The frontend gets Firebase ID tokens and sends them in Authorization headers

## API Endpoints

### User Order Endpoints

#### Get Current User's Orders
- **Endpoint**: `GET /api/orders/user/my-orders`
- **Authentication**: Firebase ID token required
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `status` (optional): Filter by order status (Pending, Shipped, Completed)
- **Response**:
  ```json
  {
    "orders": [...],
    "totalPages": 3,
    "currentPage": 1,
    "total": 25,
    "userEmail": "user@example.com"
  }
  ```

#### Get Specific Order by ID
- **Endpoint**: `GET /api/orders/user/:orderId`
- **Authentication**: Firebase ID token required
- **Description**: Users can only access their own orders
- **Response**: Single order object with populated product details

#### Get User's Order Statistics
- **Endpoint**: `GET /api/orders/user/stats/summary`
- **Authentication**: Firebase ID token required
- **Response**:
  ```json
  {
    "totalOrders": 15,
    "pendingOrders": 2,
    "shippedOrders": 8,
    "completedOrders": 5,
    "totalSpent": 1250.00,
    "recentOrders": [...],
    "userEmail": "user@example.com"
  }
  ```

## Frontend Integration

### Authentication Flow

1. User logs in with Firebase Auth
2. Firebase provides an ID token
3. Frontend stores token and includes it in API requests
4. Backend verifies token with Firebase Admin SDK
5. User info is extracted and used for authorization

### Usage Example

```typescript
import { userOrderService } from '../services/userOrders';

// Get user's orders
const orders = await userOrderService.getMyOrders(1, 10, 'Pending');

// Get specific order
const order = await userOrderService.getOrderById('order-id');

// Get user statistics
const stats = await userOrderService.getOrderStats();
```

### React Components

- **MyOrders**: Lists all user orders with filtering and pagination
- **OrderDetail**: Shows detailed view of a specific order
- **Routes**: Protected routes that require authentication

## Security Features

### Authorization
- Users can only access their own orders
- Orders are filtered by customer email (from Firebase token)
- Firebase ID token verification ensures authenticity

### Data Protection
- No sensitive data exposed in unauthorized requests
- Email matching prevents data leakage between users
- Firebase handles authentication security

## Database Schema

### Order Model Updates
- Added `firebaseUid` field (optional, for future use)
- Indexed `customerInfo.email` for faster queries
- Maintains existing order structure

### Query Optimization
- Index on customer email for fast user order queries
- Pagination support for large order lists
- Efficient aggregation for statistics

## Error Handling

The system handles various scenarios:
- Invalid/expired Firebase tokens
- Users trying to access others' orders
- Network connectivity issues
- Database query failures

## Testing

### Development Testing
1. Set up Firebase project with test authentication
2. Create test users and orders
3. Test API endpoints with Postman or frontend
4. Verify authorization works correctly

### Security Testing
1. Test with expired tokens
2. Try accessing other users' orders
3. Verify proper error responses
4. Test pagination and filtering

## Deployment Considerations

### Firebase Admin SDK
- Use Application Default Credentials in production
- Or configure service account properly
- Ensure Firebase project is properly set up

### Environment Variables
- Set up Firebase configuration in production
- Keep service account keys secure
- Use proper CORS settings

## Troubleshooting

### Common Issues

1. **Firebase Admin SDK not initialized**
   - Check environment variables
   - Verify Firebase project configuration
   - Ensure proper credentials

2. **Token verification fails**
   - Check if Firebase ID token is valid
   - Verify token is being sent correctly
   - Check Firebase project settings

3. **Orders not showing**
   - Verify user email matches order email
   - Check database connection
   - Ensure proper indexing

4. **Authorization errors**
   - Check if user is authenticated
   - Verify token is not expired
   - Ensure proper middleware setup

### Logs
Important events are logged:
- Firebase token verification failures
- Order access attempts
- Database query errors
