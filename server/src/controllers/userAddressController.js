const prisma = require('../utils/prisma');

// Get user addresses
exports.getUserAddresses = async (req, res) => {
    try {
        const userId = req.user?.id || req.params.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const addresses = await prisma.useraddress.findMany({
            where: { userId },
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        res.json({
            success: true,
            data: addresses
        });
    } catch (error) {
        console.error('Get user addresses error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching addresses',
            error: error.message
        });
    }
};

// Get address by ID
exports.getAddressById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const address = await prisma.useraddress.findFirst({
            where: {
                id,
                userId
            }
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        res.json({
            success: true,
            data: address
        });
    } catch (error) {
        console.error('Get address error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching address',
            error: error.message
        });
    }
};

// Create address
exports.createAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, label, address, lat, lng, phone, building, floor, apartment, notes, isDefault } = req.body;

        if (!address || lat === undefined || lng === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Address, latitude, and longitude are required'
            });
        }

        // If setting as default, unset other default addresses
        if (isDefault) {
            await prisma.useraddress.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false }
            });
        }

        const newAddress = await prisma.useraddress.create({
            data: {
                userId,
                type: type || null,
                label: label || null,
                address,
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                phone: phone || null,
                building: building || null,
                floor: floor || null,
                apartment: apartment || null,
                notes: notes || null,
                isDefault: isDefault || false
            }
        });

        res.status(201).json({
            success: true,
            message: 'Address created successfully',
            data: newAddress
        });
    } catch (error) {
        console.error('Create address error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating address',
            error: error.message
        });
    }
};

// Update address
exports.updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { type, label, address, lat, lng, phone, building, floor, apartment, notes, isDefault } = req.body;

        // Verify address belongs to user
        const existingAddress = await prisma.useraddress.findFirst({
            where: {
                id,
                userId
            }
        });

        if (!existingAddress) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // If setting as default, unset other default addresses
        if (isDefault && !existingAddress.isDefault) {
            await prisma.useraddress.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false }
            });
        }

        const updateData = {};
        if (type !== undefined) updateData.type = type;
        if (label !== undefined) updateData.label = label;
        if (address !== undefined) updateData.address = address;
        if (lat !== undefined) updateData.lat = parseFloat(lat);
        if (lng !== undefined) updateData.lng = parseFloat(lng);
        if (phone !== undefined) updateData.phone = phone;
        if (building !== undefined) updateData.building = building;
        if (floor !== undefined) updateData.floor = floor;
        if (apartment !== undefined) updateData.apartment = apartment;
        if (notes !== undefined) updateData.notes = notes;
        if (isDefault !== undefined) updateData.isDefault = isDefault;

        const updatedAddress = await prisma.useraddress.update({
            where: { id },
            data: updateData
        });

        res.json({
            success: true,
            message: 'Address updated successfully',
            data: updatedAddress
        });
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating address',
            error: error.message
        });
    }
};

// Delete address
exports.deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify address belongs to user
        const address = await prisma.useraddress.findFirst({
            where: {
                id,
                userId
            }
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        await prisma.useraddress.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Address deleted successfully'
        });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting address',
            error: error.message
        });
    }
};

// Set default address
exports.setDefaultAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify address belongs to user
        const address = await prisma.useraddress.findFirst({
            where: {
                id,
                userId
            }
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // Unset other default addresses
        await prisma.useraddress.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false }
        });

        // Set this address as default
        const updatedAddress = await prisma.useraddress.update({
            where: { id },
            data: { isDefault: true }
        });

        res.json({
            success: true,
            message: 'Default address updated successfully',
            data: updatedAddress
        });
    } catch (error) {
        console.error('Set default address error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating default address',
            error: error.message
        });
    }
};


