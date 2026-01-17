const { validatePrice, validatePrices } = require('../validators/price.validator');

/**
 * Validate restaurant data
 */
exports.validateRestaurant = (req, res, next) => {
    const { name, address, latitude, longitude, delivery_fee, min_order_amount } = req.body;

    const errors = [];

    // Required fields
    if (!name) errors.push('Restaurant name is required');
    if (!address) errors.push('Address is required');
    if (!latitude) errors.push('Latitude is required');
    if (!longitude) errors.push('Longitude is required');

    // Validate prices
    if (delivery_fee !== undefined) {
        const result = validatePrice(delivery_fee, 'Delivery fee');
        if (!result.isValid) {
            errors.push(result.error);
        } else {
            req.body.delivery_fee = result.value;
        }
    }

    if (min_order_amount !== undefined) {
        const result = validatePrice(min_order_amount, 'Minimum order amount');
        if (!result.isValid) {
            errors.push(result.error);
        } else {
            req.body.min_order_amount = result.value;
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
};

/**
 * Validate product data
 */
exports.validateProduct = (req, res, next) => {
    const { name, price, discountedPrice } = req.body;

    const errors = [];

    // Required fields
    if (!name) errors.push('Product name is required');
    if (price === undefined || price === null) errors.push('Price is required');

    // Validate price
    if (price !== undefined) {
        const result = validatePrice(price, 'Price');
        if (!result.isValid) {
            errors.push(result.error);
        } else {
            req.body.price = result.value;
        }
    }

    // Validate discounted price
    if (discountedPrice !== undefined && discountedPrice !== null) {
        const result = validatePrice(discountedPrice, 'Discounted price');
        if (!result.isValid) {
            errors.push(result.error);
        } else {
            req.body.discountedPrice = result.value;
            
            // Ensure discounted price is less than regular price
            if (req.body.discountedPrice >= req.body.price) {
                errors.push('Discounted price must be less than regular price');
            }
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
};

/**
 * Validate coupon data
 */
exports.validateCoupon = (req, res, next) => {
    const { code, discount_value, min_order_amount, max_discount_amount } = req.body;

    const errors = [];

    // Required fields
    if (!code) errors.push('Coupon code is required');
    if (!discount_value) errors.push('Discount value is required');

    // Validate discount value
    if (discount_value !== undefined) {
        const result = validatePrice(discount_value, 'Discount value');
        if (!result.isValid) {
            errors.push(result.error);
        } else {
            req.body.discount_value = result.value;
        }
    }

    // Validate min order amount
    if (min_order_amount !== undefined && min_order_amount !== null) {
        const result = validatePrice(min_order_amount, 'Minimum order amount');
        if (!result.isValid) {
            errors.push(result.error);
        } else {
            req.body.min_order_amount = result.value;
        }
    }

    // Validate max discount
    if (max_discount_amount !== undefined && max_discount_amount !== null) {
        const result = validatePrice(max_discount_amount, 'Maximum discount amount');
        if (!result.isValid) {
            errors.push(result.error);
        } else {
            req.body.max_discount_amount = result.value;
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
};

/**
 * Validate order data
 */
exports.validateOrder = (req, res, next) => {
    const { subtotal, deliveryFee, discount, tax, total } = req.body;

    const errors = [];

    // Validate all price fields
    const priceValidation = validatePrices({
        subtotal,
        deliveryFee,
        discount,
        tax,
        total
    });

    if (!priceValidation.isValid) {
        errors.push(...priceValidation.errors);
    } else {
        // Update with validated values
        Object.assign(req.body, priceValidation.validatedPrices);
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
};

