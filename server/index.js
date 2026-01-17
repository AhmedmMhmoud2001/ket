const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const http = require('http');

// Load environment variables
dotenv.config();

// Initialize Prisma Client
const prisma = require('./src/utils/prisma');

// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const restaurantRoutes = require('./src/routes/restaurants');
const productRoutes = require('./src/routes/products');
const orderRoutes = require('./src/routes/orders');
const dashboardRoutes = require('./src/routes/dashboard');
const shippingAgentRoutes = require('./src/routes/shippingAgents');
const shippingOrderRoutes = require('./src/routes/shippingOrders');
const supportRoutes = require('./src/routes/support');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "Food Delivery API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// Serve static files (uploads)
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categories', require('./src/routes/categories'));
app.use('/api/drivers', require('./src/routes/drivers'));
app.use('/api/subcategories', require('./src/routes/subcategories'));
app.use('/api/offers', require('./src/routes/offers'));
app.use('/api/notifications', require('./src/routes/notifications'));
app.use('/api/addresses', require('./src/routes/userAddress'));
app.use('/api/coupons', require('./src/routes/coupons'));
app.use('/api/upload', require('./src/routes/upload'));
app.use('/api/roles', require('./src/routes/roles'));
app.use('/api/splash', require('./src/routes/splash'));
app.use('/api/onboarding', require('./src/routes/onboarding'));
app.use('/api/favorites', require('./src/routes/favorites'));
app.use('/api/courier', require('./src/routes/courier'));
app.use('/api/chat', require('./src/routes/chat'));
app.use('/api/restaurant-owner', require('./src/routes/restaurantOwner'));
app.use('/api/shipping-agents', shippingAgentRoutes);
app.use('/api/shipping-orders', shippingOrderRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/points', require('./src/routes/points'));
app.use('/api', require('./src/routes/content'));
app.use('/api/cart', require('./src/routes/cart'));
app.use('/api/order-status-history', require('./src/routes/orderStatusHistory'));
app.use('/api/restaurant-hours', require('./src/routes/restaurantHours'));
app.use('/api/payment-methods', require('./src/routes/paymentMethods'));
app.use('/api/driver-location', require('./src/routes/driverLocation'));
app.use('/api/delivery-zones', require('./src/routes/deliveryZone'));
app.use('/api/delivery-time-estimate', require('./src/routes/deliveryTimeEstimate'));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  // Store user info in socket
  socket.userId = null;

  // Authenticate socket connection
  socket.on('authenticate', async (data) => {
    try {
      // In production, verify JWT token here
      // For now, we'll accept userId directly
      socket.userId = data.userId;
      socket.join(`user-${data.userId}`);
      console.log(`Socket ${socket.id} authenticated as user: ${data.userId}`);
      socket.emit('authenticated', { success: true });
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('authenticated', { success: false, error: error.message });
    }
  });

  // Join order tracking room
  socket.on('join-order', (orderId) => {
    socket.join(`order-${orderId}`);
    console.log(`Socket ${socket.id} joined order room: order-${orderId}`);
  });

  // Join courier order tracking room
  socket.on('join-courier-order', (courierOrderId) => {
    socket.join(`courier-order-${courierOrderId}`);
    console.log(`Socket ${socket.id} joined courier order room: courier-order-${courierOrderId}`);
  });

  // Leave order tracking room
  socket.on('leave-order', (orderId) => {
    socket.leave(`order-${orderId}`);
    console.log(`Socket ${socket.id} left order room: order-${orderId}`);
  });

  // Leave courier order tracking room
  socket.on('leave-courier-order', (courierOrderId) => {
    socket.leave(`courier-order-${courierOrderId}`);
    console.log(`Socket ${socket.id} left courier order room: courier-order-${courierOrderId}`);
  });

  // Send chat message
  socket.on('send-message', async (data) => {
    try {
      const { orderId, courierOrderId, receiverId, message, messageType = 'TEXT' } = data;

      if (!socket.userId) {
        socket.emit('message-error', { error: 'Not authenticated' });
        return;
      }

      if (!message || (!orderId && !courierOrderId) || !receiverId) {
        socket.emit('message-error', { error: 'Missing required fields' });
        return;
      }

      // Verify user has access to this order
      let hasAccess = false;
      if (orderId) {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          select: { userId: true, driverId: true }
        });

        if (order) {
          const driver = await prisma.driver.findUnique({
            where: { id: order.driverId || '' },
            select: { userId: true }
          });

          hasAccess = order.userId === socket.userId || driver?.userId === socket.userId;
        }
      }

      if (courierOrderId) {
        const courierOrder = await prisma.courierOrder.findUnique({
          where: { id: courierOrderId },
          select: { userId: true, driverId: true }
        });

        if (courierOrder) {
          const driver = await prisma.driver.findUnique({
            where: { id: courierOrder.driverId || '' },
            select: { userId: true }
          });

          hasAccess = courierOrder.userId === socket.userId || driver?.userId === socket.userId;
        }
      }

      if (!hasAccess) {
        socket.emit('message-error', { error: 'Access denied' });
        return;
      }

      // Create message in database
      const chatMessage = await prisma.chatMessage.create({
        data: {
          orderId: orderId || null,
          courierOrderId: courierOrderId || null,
          senderId: socket.userId,
          receiverId: receiverId,
          message: message,
          messageType: messageType.toUpperCase()
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        }
      });

      // Emit to sender (confirmation)
      socket.emit('message-sent', {
        success: true,
        message: chatMessage
      });

      // Emit to receiver
      io.to(`user-${receiverId}`).emit('new-message', {
        message: chatMessage
      });

      // Also emit to order room for real-time updates
      if (orderId) {
        io.to(`order-${orderId}`).emit('new-message', {
          message: chatMessage
        });
      }

      if (courierOrderId) {
        io.to(`courier-order-${courierOrderId}`).emit('new-message', {
          message: chatMessage
        });
      }

      console.log(`Message sent from ${socket.userId} to ${receiverId}`);
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('message-error', { error: error.message });
    }
  });

  // Mark messages as read
  socket.on('mark-messages-read', async (data) => {
    try {
      const { orderId, courierOrderId } = data;

      if (!socket.userId) {
        return;
      }

      const where = {
        receiverId: socket.userId,
        isRead: false
      };

      if (orderId) {
        where.orderId = orderId;
      }
      if (courierOrderId) {
        where.courierOrderId = courierOrderId;
      }

      await prisma.chatMessage.updateMany({
        where,
        data: {
          isRead: true
        }
      });

      socket.emit('messages-read', { success: true });
    } catch (error) {
      console.error('Mark messages read error:', error);
    }
  });

  // Driver location update
  socket.on('driver-location-update', (data) => {
    const { orderId, courierOrderId, latitude, longitude, speed, heading } = data;

    // Broadcast to all clients tracking this order
    if (orderId) {
      io.to(`order-${orderId}`).emit('driver-location', {
        orderId,
        latitude,
        longitude,
        speed,
        heading,
        timestamp: new Date().toISOString()
      });
    }

    if (courierOrderId) {
      io.to(`courier-order-${courierOrderId}`).emit('driver-location', {
        courierOrderId,
        latitude,
        longitude,
        speed,
        heading,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Order status update
  socket.on('order-status-update', (data) => {
    const { orderId, courierOrderId, status } = data;

    // Broadcast to all clients tracking this order
    if (orderId) {
      io.to(`order-${orderId}`).emit('order-status', {
        orderId,
        status,
        timestamp: new Date().toISOString()
      });
    }

    if (courierOrderId) {
      io.to(`courier-order-${courierOrderId}`).emit('order-status', {
        courierOrderId,
        status,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { orderId, courierOrderId, receiverId, isTyping } = data;

    if (orderId) {
      socket.to(`order-${orderId}`).emit('user-typing', {
        userId: socket.userId,
        isTyping,
        orderId
      });
    }

    if (courierOrderId) {
      socket.to(`courier-order-${courierOrderId}`).emit('user-typing', {
        userId: socket.userId,
        isTyping,
        courierOrderId
      });
    }

    // Also send to specific user
    if (receiverId) {
      io.to(`user-${receiverId}`).emit('user-typing', {
        userId: socket.userId,
        isTyping,
        orderId,
        courierOrderId
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);

  // Test Prisma connection
  try {
    await prisma.$connect();
    console.log('✅ Connected to database via Prisma');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
  }

  console.log('=================================');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});