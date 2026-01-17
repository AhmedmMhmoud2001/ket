const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');

// Get all customers with search and filters
exports.getAllCustomers = async (req, res) => {
    try {
        const { search, status, page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        // Build where clause - Customers have role CUSTOMER
        const where = { role: 'CUSTOMER' };

        // Search filter
        if (search) {
            where.OR = [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } }
            ];
        }

        // Status filter
        if (status) {
            where.status = status.toUpperCase();
        }

        const [customers, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    avatar: true,
                    role: true,
                    status: true,
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.user.count({ where })
        ]);

        // Format customers with full_name
        const formattedCustomers = customers.map(customer => ({
            ...customer,
            full_name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
            created_at: customer.createdAt,
            is_active: customer.status === 'ACTIVE'
        }));

        res.json({
            success: true,
            data: {
                customers: formattedCustomers,
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customers',
            error: error.message
        });
    }
};

// Update Customer Status
exports.updateCustomerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        if (is_active === undefined) {
            return res.status(400).json({
                success: false,
                message: 'is_active field is required'
            });
        }

        const customer = await prisma.user.findUnique({
            where: { id, role: 'CUSTOMER' }
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        await prisma.user.update({
            where: { id },
            data: { status: is_active ? 'ACTIVE' : 'BANNED' }
        });

        res.json({
            success: true,
            message: `Customer ${is_active ? 'activated' : 'banned'} successfully`
        });
    } catch (error) {
        console.error('Update customer status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating customer status',
            error: error.message
        });
    }
};

// Create Customer
exports.createCustomer = async (req, res) => {
    try {
        const { full_name, email, phone, password, avatar_url } = req.body;

        // Check if exists
        const existing = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { phone: phone }
                ]
            }
        });

        if (existing) {
            return res.status(400).json({ 
                success: false, 
                message: 'Customer with this email or phone already exists' 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Split full_name into firstName and lastName
        const nameParts = full_name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                phone,
                password: hashedPassword,
                avatar: avatar_url || null,
                role: 'CUSTOMER',
                status: 'ACTIVE'
            }
        });

        res.status(201).json({ success: true, message: 'Customer created successfully' });
    } catch (error) {
        console.error('Create customer error:', error);
        res.status(500).json({ success: false, message: 'Error creating customer' });
    }
};

// Update Customer
exports.updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, email, phone, avatar_url } = req.body;

        // Check if exists
        const existing = await prisma.user.findUnique({
            where: { id }
        });

        if (!existing) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // Split full_name into firstName and lastName
        const nameParts = full_name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        const updateData = {
            firstName,
            lastName,
            email,
            phone
        };

        if (avatar_url !== undefined) {
            updateData.avatar = avatar_url;
        }

        await prisma.user.update({
            where: { id },
            data: updateData
        });

        res.json({ success: true, message: 'Customer updated successfully' });
    } catch (error) {
        console.error('Update customer error:', error);
        res.status(500).json({ success: false, message: 'Error updating customer' });
    }
};
