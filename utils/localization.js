// Utility functions for working with localized strings

/**
 * Get localized string value based on language preference
 * @param {Object} localizedString - Object with en and vi properties
 * @param {string} language - Language code ('en' or 'vi')
 * @returns {string} - Localized string value
 */
export const getLocalizedString = (localizedString, language = 'en') => {
  if (!localizedString || typeof localizedString !== 'object') {
    return localizedString || '';
  }
  
  return localizedString[language] || localizedString.en || localizedString.vi || '';
};

/**
 * Create a localized string object
 * @param {string} en - English text
 * @param {string} vi - Vietnamese text
 * @returns {Object} - Localized string object
 */
export const createLocalizedString = (en, vi) => ({
  en,
  vi
});

/**
 * Convert old product format to new localized format
 * @param {Object} oldProduct - Product in old format
 * @returns {Object} - Product in new localized format
 */
export const convertToLocalizedProduct = (oldProduct) => {
  if (!oldProduct) return null;

  const convertedProduct = {
    ...oldProduct,
    name: typeof oldProduct.name === 'string' 
      ? createLocalizedString(oldProduct.name, oldProduct.name)
      : oldProduct.name,
    shortDescription: typeof oldProduct.shortDescription === 'string'
      ? createLocalizedString(oldProduct.shortDescription, oldProduct.shortDescription)
      : oldProduct.shortDescription,
    detailDescription: typeof oldProduct.detailDescription === 'string'
      ? createLocalizedString(oldProduct.detailDescription, oldProduct.detailDescription)
      : oldProduct.detailDescription,
    specifications: Array.isArray(oldProduct.specifications) 
      ? oldProduct.specifications 
      : convertSpecificationsToArray(oldProduct.specifications)
  };

  return convertedProduct;
};

/**
 * Convert specifications from Map/Object format to Array format
 * @param {Map|Object} specifications - Specifications in Map or Object format
 * @returns {Array} - Specifications in Array format
 */
export const convertSpecificationsToArray = (specifications) => {
  if (!specifications) return [];
  
  const specArray = [];
  
  if (specifications instanceof Map) {
    for (const [key, value] of specifications) {
      specArray.push({
        key: createLocalizedString(key, key),
        value: createLocalizedString(value, value)
      });
    }
  } else if (typeof specifications === 'object') {
    for (const [key, value] of Object.entries(specifications)) {
      specArray.push({
        key: createLocalizedString(key, key),
        value: createLocalizedString(value, value)
      });
    }
  }
  
  return specArray;
};

/**
 * Convert specifications from Array format to Map/Object format (for backward compatibility)
 * @param {Array} specifications - Specifications in Array format
 * @returns {Object} - Specifications in Object format
 */
export const convertSpecificationsToObject = (specifications, language = 'en') => {
  if (!Array.isArray(specifications)) return {};
  
  const specObject = {};
  
  specifications.forEach(spec => {
    if (spec.key && spec.value) {
      const key = getLocalizedString(spec.key, language);
      const value = getLocalizedString(spec.value, language);
      specObject[key] = value;
    }
  });
  
  return specObject;
};

/**
 * Validate localized string structure
 * @param {Object} localizedString - Object to validate
 * @returns {boolean} - Whether the object is a valid localized string
 */
export const isValidLocalizedString = (localizedString) => {
  return (
    localizedString &&
    typeof localizedString === 'object' &&
    typeof localizedString.en === 'string' &&
    typeof localizedString.vi === 'string'
  );
};

/**
 * Validate product specification structure
 * @param {Object} specification - Specification object to validate
 * @returns {boolean} - Whether the specification is valid
 */
export const isValidProductSpecification = (specification) => {
  return (
    specification &&
    typeof specification === 'object' &&
    isValidLocalizedString(specification.key) &&
    isValidLocalizedString(specification.value)
  );
};
