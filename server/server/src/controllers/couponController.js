const prisma = require('../utils/prisma');

// Get all coupons
exports.getAllCoupons = async (req, res) => {
    try {
        const { search, is_active, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const where = {};

        if (search) {
            where.OR = [
                { code: { contains: search } },
                { description: { contains: search } }
            ];
        }

        if (is_active !== undefined) {
            where.isActive = is_active === 'true';
        }

        const [coupons, total] = await Promise.all([
            prisma.coupon.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.coupon.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                coupons,
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    } catch (error) {
        console.error('Get coupons error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching coupons',
            error: error.message
        });
    }
};

// Get coupon by ID
exports.getCouponById = async (req, res) => {
    try {
        const { id } = req.params;

        const coupon = await prisma.coupon.findUnique({
            where: { id }
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        res.json({
            success: true,
            data: coupon
        });
    } catch (error) {
        console.error('Get coupon error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching coupon',
            error: error.message
        });
    }
};

// Create coupon
exports.createCoupon = async (req, res) => {
    try {
        const {
            code,
            description,
            discount_type,
            discount_value,
            min_order_amount,
            max_discount_amount,
            usage_limit,
            start_date,
            end_date,
            is_active
        } = req.body;

        if (!code || !discount_type || !discount_value || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Validate dates
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        
        if (startDate > endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date cannot be after end date'
            });
        }

        // Validate discount value
        const discountValue = parseFloat(discount_value);
        if (discountValue <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Discount value must be greater than 0'
            });
        }

        if (discount_type === 'percentage' && discountValue > 100) {
            return res.status(400).json({
                success: false,
                message: 'Discount percentage cannot be greater than 100%'
            });
        }

        // Check if code already exists
        const existing = await prisma.coupon.findUnique({
            where: { code }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code already exists'
            });
        }

        const coupon = await prisma.coupon.create({
            data: {
                code,
                description: description || null,
                type: discount_type === 'percentage' ? 'PERCENTAGE' : 'FIXED_AMOUNT',
                discountValue: parseFloat(discount_value),
                minOrderAmount: min_order_amount ? parseFloat(min_order_amount) : 0,
                maxDiscount: max_discount_amount ? parseFloat(max_discount_amount) : null,
                usageLimit: usage_limit ? parseInt(usage_limit) : null,
                startDate: new Date(start_date),
                expiryDate: new Date(end_date),
                isActive: is_active !== undefined ? is_active : true
            }
        });

        res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            data: coupon
        });
    } catch (error) {
        console.error('Create coupon error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating coupon',
            error: error.message
        });
    }
};

// Update coupon
exports.updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const existingCoupon = await prisma.coupon.findUnique({
            where: { id }
        });

        if (!existingCoupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        // Check if code is being updated and if it already exists
        if (updateData.code && updateData.code !== existingCoupon.code) {
            const codeExists = await prisma.coupon.findUnique({
                where: { code: updateData.code }
            });

            if (codeExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Coupon code already exists'
                });
            }
        }

        // Validate dates if both are being updated or one is being updated
        const finalStartDate = updateData.start_date ? new Date(updateData.start_date) : existingCoupon.startDate;
        const finalEndDate = updateData.end_date ? new Date(updateData.end_date) : existingCoupon.expiryDate;
        
        if (finalStartDate > finalEndDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date cannot be after end date'
            });
        }

        // Validate discount value if being updated
        if (updateData.discount_value !== undefined) {
            const discountValue = parseFloat(updateData.discount_value);
            if (discountValue <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Discount value must be greater than 0'
                });
            }

            const finalDiscountType = updateData.discount_type || (existingCoupon.type === 'PERCENTAGE' ? 'percentage' : 'fixed');
            if (finalDiscountType === 'percentage' && discountValue > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Discount percentage cannot be greater than 100%'
                });
            }
        }

        // Map fields
        const mappedData = {};
        if (updateData.code) mappedData.code = updateData.code;
        if (updateData.description !== undefined) mappedData.description = updateData.description;
        if (updateData.discount_type) mappedData.type = updateData.discount_type === 'percentage' ? 'PERCENTAGE' : 'FIXED_AMOUNT';
        if (updateData.discount_value) mappedData.discountValue = parseFloat(updateData.discount_value);
        if (updateData.min_order_amount !== undefined) mappedData.minOrderAmount = parseFloat(updateData.min_order_amount);
        if (updateData.max_discount_amount !== undefined) mappedData.maxDiscount = updateData.max_discount_amount ? parseFloat(updateData.max_discount_amount) : null;
        if (updateData.usage_limit !== undefined) mappedData.usageLimit = updateData.usage_limit ? parseInt(updateData.usage_limit) : null;
        if (updateData.start_date) mappedData.startDate = finalStartDate;
        if (updateData.end_date) mappedData.expiryDate = finalEndDate;
        if (updateData.is_active !== undefined) mappedData.isActive = updateData.is_active;

        if (Object.keys(mappedData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        const coupon = await prisma.coupon.update({
            where: { id },
            data: mappedData
        });

        res.json({
            success: true,
            message: 'Coupon updated successfully',
            data: coupon
        });
    } catch (error) {
        console.error('Update coupon error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating coupon',
            error: error.message
        });
    }
};

// Delete coupon
exports.deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        const coupon = await prisma.coupon.findUnique({
            where: { id }
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        await prisma.coupon.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Coupon deleted successfully'
        });
    } catch (error) {
        console.error('Delete coupon error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting coupon',
            error: error.message
        });
    }
};
