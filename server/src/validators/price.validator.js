/**
 * Price Validation Utilities
 * Ensures all prices are non-negative (>= 0)
 */

/**
 * Validate single price
 * @param {number} price - Price to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {Object} - { isValid: boolean, error: string }
 */
exports.validatePrice = (price, fieldName = 'Price') => {
    if (price === null || price === undefined) {
        return { isValid: false, error: `${fieldName} is required` };
    }

    const numPrice = parseFloat(price);

    if (isNaN(numPrice)) {
        return { isValid: false, error: `${fieldName} must be a valid number` };
    }

    if (numPrice < 0) {
        return { isValid: false, error: `${fieldName} cannot be negative` };
    }

    return { isValid: true, value: numPrice };
};

/**
 * Validate multiple prices
 * @param {Object} prices - Object with price fields { price: 10, deliveryFee: 5 }
 * @returns {Object} - { isValid: boolean, errors: Array, validatedPrices: Object }
 */
exports.validatePrices = (prices) => {
    const errors = [];
    const validatedPrices = {};

    for (const [key, value] of Object.entries(prices)) {
        if (value !== null && value !== undefined) {
            const result = this.validatePrice(value, key);
            
            if (!result.isValid) {
                errors.push(result.error);
            } else {
                validatedPrices[key] = result.value;
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        validatedPrices
    };
};

/**
 * Middleware to validate prices in request body
 * @param {Array} priceFields - Array of field names to validate
 */
exports.validatePriceFields = (priceFields = []) => {
    return (req, res, next) => {
        const errors = [];

        priceFields.forEach(field => {
            const value = req.body[field];
            
            if (value !== null && value !== undefined) {
                const result = this.validatePrice(value, field);
                
                if (!result.isValid) {
                    errors.push(result.error);
                } else {
                    // Update with validated value
                    req.body[field] = result.value;
                }
            }
        });

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }

        next();
    };
};

/**
 * Ensure price is not negative
 * @param {number} price
 * @returns {number} - Always returns 0 or positive number
 */
exports.ensurePositivePrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) || numPrice < 0 ? 0 : numPrice;
};

