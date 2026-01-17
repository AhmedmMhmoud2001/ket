const prisma = require('../utils/prisma');

// Get user payment methods
exports.getUserPaymentMethods = async (req, res) => {
    try {
        const userId = req.user?.id || req.params.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const paymentMethods = await prisma.paymentMethod.findMany({
            where: {
                userId,
                isActive: true
            },
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        res.json({
            success: true,
            data: paymentMethods
        });
    } catch (error) {
        console.error('Get payment methods error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment methods',
            error: error.message
        });
    }
};

// Add payment method
exports.addPaymentMethod = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, provider, last4, expiryMonth, expiryYear, isDefault } = req.body;

        if (!type) {
            return res.status(400).json({
                success: false,
                message: 'Payment method type is required'
            });
        }

        // If setting as default, unset other default methods
        if (isDefault) {
            await prisma.paymentMethod.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false }
            });
        }

        const paymentMethod = await prisma.paymentMethod.create({
            data: {
                userId,
                type,
                provider: provider || null,
                last4: last4 || null,
                expiryMonth: expiryMonth ? parseInt(expiryMonth) : null,
                expiryYear: expiryYear ? parseInt(expiryYear) : null,
                isDefault: isDefault || false,
                isActive: true
            }
        });

        res.status(201).json({
            success: true,
            message: 'Payment method added successfully',
            data: paymentMethod
        });
    } catch (error) {
        console.error('Add payment method error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding payment method',
            error: error.message
        });
    }
};

// Update payment method
exports.updatePaymentMethod = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { isDefault, isActive } = req.body;

        // Verify payment method belongs to user
        const paymentMethod = await prisma.paymentMethod.findFirst({
            where: {
                id,
                userId
            }
        });

        if (!paymentMethod) {
            return res.status(404).json({
                success: false,
                message: 'Payment method not found'
            });
        }

        // If setting as default, unset other default methods
        if (isDefault && !paymentMethod.isDefault) {
            await prisma.paymentMethod.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false }
            });
        }

        const updatedMethod = await prisma.paymentMethod.update({
            where: { id },
            data: {
                isDefault: isDefault !== undefined ? isDefault : paymentMethod.isDefault,
                isActive: isActive !== undefined ? isActive : paymentMethod.isActive
            }
        });

        res.json({
            success: true,
            message: 'Payment method updated successfully',
            data: updatedMethod
        });
    } catch (error) {
        console.error('Update payment method error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating payment method',
            error: error.message
        });
    }
};

// Delete payment method
exports.deletePaymentMethod = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify payment method belongs to user
        const paymentMethod = await prisma.paymentMethod.findFirst({
            where: {
                id,
                userId
            }
        });

        if (!paymentMethod) {
            return res.status(404).json({
                success: false,
                message: 'Payment method not found'
            });
        }

        await prisma.paymentMethod.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Payment method deleted successfully'
        });
    } catch (error) {
        console.error('Delete payment method error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting payment method',
            error: error.message
        });
    }
};

