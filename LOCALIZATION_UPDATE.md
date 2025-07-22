# Product Localization Update Guide

## Overview
The backend has been updated to support localized product information in both English and Vietnamese. This update includes changes to the database schema, API endpoints, and data validation.

## Changes Made

### 1. Database Schema Updates
- **Product Model**: Updated to support localized strings for `name`, `shortDescription`, and `detailDescription`
- **Specifications**: Changed from Map format to Array format with localized keys and values

### 2. API Endpoints
All product endpoints now support a `language` query parameter:
- `GET /api/products?language=en` - Returns products with English content
- `GET /api/products?language=vi` - Returns products with Vietnamese content
- `GET /api/products/:id?language=en` - Returns single product with specified language

### 3. Data Structure

#### Old Format:
```json
{
  "name": "Vans Old Skool",
  "shortDescription": "Classic skate shoes",
  "detailDescription": "Detailed description...",
  "specifications": {
    "Material": "Canvas",
    "Color": "Black"
  }
}
```

#### New Format:
```json
{
  "name": {
    "en": "Vans Old Skool",
    "vi": "Vans Old Skool"
  },
  "shortDescription": {
    "en": "Classic skate shoes",
    "vi": "Giày skate cổ điển"
  },
  "detailDescription": {
    "en": "Detailed description...",
    "vi": "Mô tả chi tiết..."
  },
  "specifications": [
    {
      "key": { "en": "Material", "vi": "Chất liệu" },
      "value": { "en": "Canvas", "vi": "Canvas" }
    }
  ]
}
```

## Migration

### Option 1: Migrate Existing Data
```bash
npm run migrate
```
This will:
- Create a backup of existing products
- Convert existing products to the new format
- Duplicate content in both languages (requires manual translation)

### Option 2: Fresh Start with Sample Data
```bash
npm run seed
```
This will:
- Clear existing products
- Insert new sample products with proper localization

## API Usage Examples

### Get Products in English (Default)
```javascript
fetch('/api/products?language=en')
```

### Get Products in Vietnamese
```javascript
fetch('/api/products?language=vi')
```

### Create a New Product (Admin Only)
```javascript
fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'
  },
  body: JSON.stringify({
    name: {
      en: "Nike Air Max",
      vi: "Nike Air Max"
    },
    price: 2500000,
    shortDescription: {
      en: "Comfortable running shoes",
      vi: "Giày chạy bộ thoải mái"
    },
    detailDescription: {
      en: "High-quality running shoes with Air Max technology",
      vi: "Giày chạy bộ chất lượng cao với công nghệ Air Max"
    },
    specifications: [
      {
        key: { en: "Material", vi: "Chất liệu" },
        value: { en: "Mesh and synthetic", vi: "Lưới và synthetic" }
      }
    ],
    sizes: ["38", "39", "40", "41", "42"],
    stock: 50,
    image: "/path/to/image.jpg",
    images: ["/path/to/image1.jpg", "/path/to/image2.jpg"]
  })
})
```

## Validation Rules
- All localized strings must have both `en` and `vi` properties
- Both English and Vietnamese content is required
- Specifications must be arrays with proper localized key-value pairs

## Backward Compatibility
- API responses include a `localizedData` field with the full localized structure
- Product names in orders will use the English version by default
- Search functionality works across both languages

## Files Modified
- `backend/models/Product.js` - Updated schema
- `backend/routes/products.js` - Updated validation and response transformation
- `backend/routes/orders.js` - Updated to handle localized product names
- `backend/seed.js` - Updated sample data
- `backend/utils/localization.js` - New utility functions

## Next Steps
1. Run the migration or seed script
2. Update frontend applications to use the new API format
3. Add proper Vietnamese translations to existing products
4. Test all functionality with both languages
