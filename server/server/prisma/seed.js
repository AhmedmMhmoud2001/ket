const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clear existing data
  console.log('🗑️  Clearing existing data...');
  // Delete in reverse order of relations
  await prisma.activityLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.favoriteProduct.deleteMany();
  await prisma.favoriteRestaurant.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.promotionProduct.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatParticipant.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.shippingOrderImage.deleteMany();
  await prisma.shippingOrder.deleteMany();
  await prisma.shippingAgent.deleteMany();
  await prisma.foodOrderItem.deleteMany();
  await prisma.foodOrder.deleteMany();
  await prisma.deliveryDriver.deleteMany();
  await prisma.productOption.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.category.deleteMany();
  await prisma.userAddress.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleared existing data');

  // 2. Create Roles
  console.log('Creating roles...');
  const roles = [
    'ADMIN',
    'RESTAURANT_OWNER',
    'RESTAURANT_ADMIN',
    'OPERATIONS_MANAGER',
    'DELIVERY_OPERATIONS_MANAGER',
    'DRIVER',
    'AGENT',
    'CUSTOMER'
  ];
  const roleMap = {};
  for (const roleName of roles) {
    const role = await prisma.role.create({
      data: { name: roleName }
    });
    roleMap[roleName] = role.id;
  }

  // 3. Create Users
  console.log('Creating users for all roles...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const userData = [
    { name: 'Admin User', email: 'admin@tak.com', phone: '000000', role: 'ADMIN' },
    { name: 'Restaurant Owner', email: 'owner@test.com', phone: '111111', role: 'RESTAURANT_OWNER' },
    { name: 'Restaurant Admin', email: 'rest_admin@test.com', phone: '222222', role: 'RESTAURANT_ADMIN' },
    { name: 'Ops Manager', email: 'ops@test.com', phone: '333333', role: 'OPERATIONS_MANAGER' },
    { name: 'Delivery Ops', email: 'delivery_ops@test.com', phone: '444444', role: 'DELIVERY_OPERATIONS_MANAGER' },
    { name: 'Test Driver', email: 'driver@test.com', phone: '555555', role: 'DRIVER' },
    { name: 'Test Agent', email: 'agent@test.com', phone: '666666', role: 'AGENT' },
    { name: 'Test Customer', email: 'customer@test.com', phone: '777777', role: 'CUSTOMER' },
  ];

  const userMap = {};

  for (const u of userData) {
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        phone: u.phone,
        password: hashedPassword,
        roles: {
          create: { roleId: roleMap[u.role] }
        }
      }
    });
    userMap[u.role] = user.id;
    console.log(`✅ Created ${u.role}: ${u.email}`);
  }

  // 4. Create Category
  const catFood = await prisma.category.create({
    data: { nameAr: 'مأكولات', nameEn: 'Food', type: 'RESTAURANT' }
  });

  // 5. Create Restaurant for the Owner
  const restaurant = await prisma.restaurant.create({
    data: {
      nameAr: 'قصر البرجر',
      nameEn: 'Burger Palace',
      phone: '999888777',
      deliveryType: 'MOTORCYCLE',
      categoryId: catFood.id,
      ownerId: userMap['RESTAURANT_OWNER'],
      isActive: true
    }
  });

  // 6. Profiles for specialized roles
  console.log('Creating specialized profiles...');

  // Delivery Driver Profile
  await prisma.deliveryDriver.create({
    data: {
      userId: userMap['DRIVER'],
      isOnline: true,
      rating: 4.8,
      isPlatformDriver: true
    }
  });

  // Shipping Agent Profile
  await prisma.shippingAgent.create({
    data: {
      userId: userMap['AGENT'],
      vehicleType: 'VAN',
      rating: 4.5,
      isActive: true
    }
  });

  console.log('✅ Seeding completed! Use "password123" for all users.');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
