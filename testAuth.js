import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testAuthentication() {
  try {
    console.log('🧪 Testing Authentication System...\n');

    // Test 1: Login with admin credentials
    console.log('1. Testing admin login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Login successful!');
      console.log('Token received:', loginData.token ? 'Yes' : 'No');
      
      const token = loginData.token;

      // Test 2: Access protected route with token
      console.log('\n2. Testing protected route access...');
      const protectedResponse = await fetch(`${BASE_URL}/products`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (protectedResponse.ok) {
        console.log('✅ Protected route accessible with token');
      } else {
        console.log('❌ Protected route access failed');
      }

      // Test 3: Access protected route without token
      console.log('\n3. Testing protected route without token...');
      const unprotectedResponse = await fetch(`${BASE_URL}/orders`, {
        method: 'GET'
      });

      if (unprotectedResponse.status === 401) {
        console.log('✅ Protected route properly rejected without token');
      } else {
        console.log('❌ Protected route should require authentication');
      }

      // Test 4: Verify token
      console.log('\n4. Testing token verification...');
      const verifyResponse = await fetch(`${BASE_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (verifyResponse.ok) {
        console.log('✅ Token verification successful');
      } else {
        console.log('❌ Token verification failed');
      }

    } else {
      console.log('❌ Login failed:', loginData.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nMake sure the server is running on http://localhost:5000');
  }
}

// Run tests
testAuthentication();
