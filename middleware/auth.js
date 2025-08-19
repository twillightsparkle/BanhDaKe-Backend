import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';
import Admin from '../models/Admin.js';

import serviceAccount from "../firebaseServiceKey.json" with { type: "json" };

// Initialize Firebase Admin SDK (only if not already initialized)
if (!admin.apps.length) {
  try {
    // You can initialize with service account key file or environment variables
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.warn('Firebase Admin SDK initialization failed:', error.message);
    console.warn('User authentication will not work without proper Firebase configuration');
  }
}

// Middleware to verify JWT token and authenticate admin
export const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find admin
    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: 'Invalid token or admin not found' });
    }

    // Add admin info to request object
    req.admin = {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware to check if user is admin (can be extended for other roles)
export const requireAdmin = (req, res, next) => {
  if (req.admin?.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Middleware to verify Firebase ID token and authenticate user
export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Verify Firebase ID token
    if (!admin.apps.length) {
      throw new Error('Firebase Admin SDK not initialized');
    }
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture
    };

    next();
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
