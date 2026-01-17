const prisma = require('../utils/prisma');

// Get delivery zones for a restaurant
exports.getRestaurantDeliveryZones = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        const zones = await prisma.deliveryZone.findMany({
            where: { restaurantId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: zones
        });
    } catch (error) {
        console.error('Get delivery zones error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching delivery zones',
            error: error.message
        });
    }
};

// Create delivery zone
exports.createDeliveryZone = async (req, res) => {
    try {
        const { restaurantId, name, coordinates, fee, minOrder, isActive } = req.body;

        if (!name || !coordinates) {
            return res.status(400).json({
                success: false,
                message: 'Zone name and coordinates are required'
            });
        }

        // Verify restaurant exists
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId }
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        const zone = await prisma.deliveryZone.create({
            data: {
                restaurantId,
                name,
                coordinates,
                fee: fee ? parseFloat(fee) : null,
                minOrder: minOrder ? parseFloat(minOrder) : null,
                isActive: isActive !== undefined ? isActive : true
            }
        });

        res.status(201).json({
            success: true,
            message: 'Delivery zone created successfully',
            data: zone
        });
    } catch (error) {
        console.error('Create delivery zone error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating delivery zone',
            error: error.message
        });
    }
};

// Update delivery zone
exports.updateDeliveryZone = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, coordinates, fee, minOrder, isActive } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (coordinates !== undefined) updateData.coordinates = coordinates;
        if (fee !== undefined) updateData.fee = fee ? parseFloat(fee) : null;
        if (minOrder !== undefined) updateData.minOrder = minOrder ? parseFloat(minOrder) : null;
        if (isActive !== undefined) updateData.isActive = isActive;

        const zone = await prisma.deliveryZone.update({
            where: { id },
            data: updateData
        });

        res.json({
            success: true,
            message: 'Delivery zone updated successfully',
            data: zone
        });
    } catch (error) {
        console.error('Update delivery zone error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating delivery zone',
            error: error.message
        });
    }
};

// Delete delivery zone
exports.deleteDeliveryZone = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.deliveryZone.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Delivery zone deleted successfully'
        });
    } catch (error) {
        console.error('Delete delivery zone error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting delivery zone',
            error: error.message
        });
    }
};

// Check if address is in delivery zone
exports.checkDeliveryZone = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { lat, lng } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const zones = await prisma.deliveryZone.findMany({
            where: {
                restaurantId,
                isActive: true
            }
        });

        // Simple point-in-polygon check (Ray casting algorithm)
        const point = { lat: parseFloat(lat), lng: parseFloat(lng) };
        let matchedZone = null;

        for (const zone of zones) {
            const coordinates = zone.coordinates;
            if (Array.isArray(coordinates) && coordinates.length > 0) {
                if (isPointInPolygon(point, coordinates)) {
                    matchedZone = zone;
                    break;
                }
            }
        }

        if (matchedZone) {
            res.json({
                success: true,
                data: {
                    inZone: true,
                    zone: matchedZone,
                    fee: matchedZone.fee || 0,
                    minOrder: matchedZone.minOrder || 0
                }
            });
        } else {
            res.json({
                success: true,
                data: {
                    inZone: false,
                    zone: null,
                    fee: null,
                    minOrder: null
                }
            });
        }
    } catch (error) {
        console.error('Check delivery zone error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking delivery zone',
            error: error.message
        });
    }
};

// Helper function: Point in Polygon (Ray casting algorithm)
function isPointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lng, yi = polygon[i].lat;
        const xj = polygon[j].lng, yj = polygon[j].lat;
        const intersect = ((yi > point.lat) !== (yj > point.lat)) &&
            (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

