const prisma = require('../utils/prisma');
const crypto = require('crypto');

// Get user points (for authenticated user)
exports.getUserPoints = async (req, res) => {
    try {
        const userId = req.user?.id || req.params.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Get or create user points
        let userPoints = await prisma.userPoints.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });

        // Create if doesn't exist
        if (!userPoints) {
            userPoints = await prisma.userPoints.create({
                data: {
                    id: crypto.randomUUID(),
                    userId,
                    points: 0,
                    earnedPoints: 0,
                    usedPoints: 0,
                    updatedAt: new Date()
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true
                        }
                    }
                }
            });
        }

        // Calculate expiring points (points expiring in next 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        res.json({
            success: true,
            data: {
                points: userPoints.points,
                earnedPoints: userPoints.earnedPoints,
                usedPoints: userPoints.usedPoints,
                expiresAt: userPoints.expiresAt,
                user: userPoints.user
            }
        });
    } catch (error) {
        console.error('Get user points error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user points',
            error: error.message
        });
    }
};

// Get all users points (admin)
exports.getAllUsersPoints = async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const where = {};

        if (search) {
            where.user = {
                OR: [
                    { name: { contains: search } },
                    { email: { contains: search } },
                    { phone: { contains: search } }
                ]
            };
        }

        const [userPoints, total] = await Promise.all([
            prisma.userPoints.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true
                        }
                    }
                },
                orderBy: { points: 'desc' },
                skip,
                take
            }),
            prisma.userPoints.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                userPoints,
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    } catch (error) {
        console.error('Get all users points error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users points',
            error: error.message
        });
    }
};

// Get points transactions (history)
exports.getPointsTransactions = async (req, res) => {
    try {
        const userId = req.user?.id || req.params.userId;
        const { type, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const where = { userId };

        if (type) {
            where.type = type;
        }

        const [transactions, total] = await Promise.all([
            prisma.pointsTransaction.findMany({
                where,
                include: {
                    order: {
                        select: {
                            id: true,
                            totalPrice: true,
                            createdAt: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.pointsTransaction.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    } catch (error) {
        console.error('Get points transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching points transactions',
            error: error.message
        });
    }
};

// Earn points (usually called after order completion)
exports.earnPoints = async (req, res) => {
    try {
        const { userId, orderId, points, description } = req.body;

        if (!userId || !points || points <= 0) {
            return res.status(400).json({
                success: false,
                message: 'User ID and valid points amount are required'
            });
        }

        // Get or create user points
        let userPoints = await prisma.userPoints.findUnique({
            where: { userId }
        });

        if (!userPoints) {
            userPoints = await prisma.userPoints.create({
                data: {
                    id: crypto.randomUUID(),
                    userId,
                    points: 0,
                    earnedPoints: 0,
                    usedPoints: 0,
                    updatedAt: new Date()
                }
            });
        }

        // Update user points
        const updatedPoints = await prisma.userPoints.update({
            where: { userId },
            data: {
                points: {
                    increment: points
                },
                earnedPoints: {
                    increment: points
                },
                updatedAt: new Date()
            }
        });

        // Create transaction record
        const transaction = await prisma.pointsTransaction.create({
            data: {
                id: crypto.randomUUID(),
                userId,
                orderId: orderId || null,
                points,
                type: 'earned',
                description: description || `Earned ${points} points${orderId ? ' from order' : ''}`
            }
        });

        res.json({
            success: true,
            message: `Successfully earned ${points} points`,
            data: {
                points: updatedPoints.points,
                transaction
            }
        });
    } catch (error) {
        console.error('Earn points error:', error);
        res.status(500).json({
            success: false,
            message: 'Error earning points',
            error: error.message
        });
    }
};

// Redeem points (use points for discount)
exports.redeemPoints = async (req, res) => {
    try {
        const { userId, points, description } = req.body;

        if (!userId || !points || points <= 0) {
            return res.status(400).json({
                success: false,
                message: 'User ID and valid points amount are required'
            });
        }

        // Get user points
        const userPoints = await prisma.userPoints.findUnique({
            where: { userId }
        });

        if (!userPoints || userPoints.points < points) {
            return res.status(400).json({
                success: false,
                message: `Insufficient points. You have ${userPoints?.points || 0} points`
            });
        }

        // Update user points
        const updatedPoints = await prisma.userPoints.update({
            where: { userId },
            data: {
                points: {
                    decrement: points
                },
                usedPoints: {
                    increment: points
                },
                updatedAt: new Date()
            }
        });

        // Create transaction record
        const transaction = await prisma.pointsTransaction.create({
            data: {
                id: crypto.randomUUID(),
                userId,
                points: -points, // Negative for used points
                type: 'used',
                description: description || `Redeemed ${points} points`
            }
        });

        res.json({
            success: true,
            message: `Successfully redeemed ${points} points`,
            data: {
                points: updatedPoints.points,
                transaction
            }
        });
    } catch (error) {
        console.error('Redeem points error:', error);
        res.status(500).json({
            success: false,
            message: 'Error redeeming points',
            error: error.message
        });
    }
};

// Admin: Adjust points (add/remove points)
exports.adjustPoints = async (req, res) => {
    try {
        const { userId, points, type, description } = req.body;

        if (!userId || !points || points <= 0) {
            return res.status(400).json({
                success: false,
                message: 'User ID and valid points amount are required'
            });
        }

        const transactionType = type || (points > 0 ? 'reward' : 'used');

        // Get or create user points
        let userPoints = await prisma.userPoints.findUnique({
            where: { userId }
        });

        if (!userPoints) {
            userPoints = await prisma.userPoints.create({
                data: {
                    id: crypto.randomUUID(),
                    userId,
                    points: 0,
                    earnedPoints: 0,
                    usedPoints: 0,
                    updatedAt: new Date()
                }
            });
        }

        // Check if removing points would result in negative balance
        if (points < 0 && userPoints.points < Math.abs(points)) {
            return res.status(400).json({
                success: false,
                message: `Insufficient points. User has ${userPoints.points} points`
            });
        }

        // Update user points
        const updateData = {
            points: {
                increment: points
            }
        };

        if (transactionType === 'reward' || transactionType === 'earned') {
            updateData.earnedPoints = {
                increment: Math.abs(points)
            };
        } else if (transactionType === 'used') {
            updateData.usedPoints = {
                increment: Math.abs(points)
            };
        }

        const updatedPoints = await prisma.userPoints.update({
            where: { userId },
            data: {
                ...updateData,
                updatedAt: new Date()
            }
        });

        // Create transaction record
        const transaction = await prisma.pointsTransaction.create({
            data: {
                id: crypto.randomUUID(),
                userId,
                points: points > 0 ? points : -Math.abs(points),
                type: transactionType,
                description: description || `${points > 0 ? 'Awarded' : 'Deducted'} ${Math.abs(points)} points by admin`
            }
        });

        res.json({
            success: true,
            message: `Successfully ${points > 0 ? 'added' : 'removed'} ${Math.abs(points)} points`,
            data: {
                points: updatedPoints.points,
                transaction
            }
        });
    } catch (error) {
        console.error('Adjust points error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adjusting points',
            error: error.message
        });
    }
};

// Get expiring points
exports.getExpiringPoints = async (req, res) => {
    try {
        const userId = req.user?.id || req.params.userId;
        const { days = 30 } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + parseInt(days));

        const userPoints = await prisma.userPoints.findUnique({
            where: { userId }
        });

        if (!userPoints || !userPoints.expiresAt) {
            return res.json({
                success: true,
                data: {
                    expiringPoints: 0,
                    expirationDate: null
                }
            });
        }

        const isExpiringSoon = userPoints.expiresAt <= expirationDate;
        const expiringPoints = isExpiringSoon ? userPoints.points : 0;

        res.json({
            success: true,
            data: {
                expiringPoints,
                expirationDate: userPoints.expiresAt,
                isExpiringSoon
            }
        });
    } catch (error) {
        console.error('Get expiring points error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching expiring points',
            error: error.message
        });
    }
};

