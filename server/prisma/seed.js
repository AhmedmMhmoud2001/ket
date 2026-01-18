const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clear existing data
  console.log('🗑️  Clearing existing data...');
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

  // 3. Create Admins
  console.log('Creating admins...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const admin2HashedPassword = await bcrypt.hash('admin789', 10);

  await prisma.user.create({
    data: {
      name: 'Main Admin',
      email: 'admin@tak.com',
      phone: '0000000000',
      password: hashedPassword,
      roles: { create: { roleId: roleMap['ADMIN'] } }
    }
  });

  await prisma.user.create({
    data: {
      name: 'Secondary Admin',
      email: 'admin2@tak.com',
      phone: '1111111111',
      password: admin2HashedPassword,
      roles: { create: { roleId: roleMap['ADMIN'] } }
    }
  });
  console.log('✅ Created 2 Admins');

  // 4. Create 10 Users (Customers)
  console.log('Creating 10 users...');
  const users = [];
  for (let i = 1; i <= 10; i++) {
    // Make first 5 users Restaurant Owners
    const roleToAssign = i <= 5 ? 'RESTAURANT_OWNER' : 'CUSTOMER';

    const user = await prisma.user.create({
      data: {
        name: i === 1 ? 'Restaurant Owner' : `User ${i}`,
        email: i === 1 ? 'owner@test.com' : `user${i}@example.com`,
        phone: `050000000${i}`,
        password: hashedPassword,
        roles: {
          create: { roleId: roleMap[roleToAssign] }
        }
      }
    });
    users.push(user);
    console.log(`✅ Created ${roleToAssign}: ${user.email}`);
  }

  // 4. Create 12 Categories
  console.log('Creating 12 categories...');
  const categories = [];
  const categoryNames = [
    ['مأكولات سريعة', 'Fast Food'],
    ['مأكولات إيطالية', 'Italian'],
    ['مأكولات بحرية', 'Seafood'],
    ['حلويات', 'Sweets'],
    ['مشروبات', 'Drinks'],
    ['مشويات', 'Grills'],
    ['مأكولات صحية', 'Healthy Food'],
    ['مأكولات يابانية', 'Japanese'],
    ['مأكولات هندية', 'Indian'],
    ['مأكولات عربية', 'Arabic Food'],
    ['مخبوزات', 'Bakery'],
    ['فواكه وخضروات', 'Fruits & Vegetables']
  ];

  for (let i = 0; i < 12; i++) {
    const category = await prisma.category.create({
      data: {
        nameAr: categoryNames[i][0],
        nameEn: categoryNames[i][1],
        type: 'RESTAURANT',
        isActive: true
      }
    });
    categories.push(category);
    console.log(`✅ Created Category: ${category.nameEn}`);
  }

  // 5. Create multiple restaurants
  console.log('Creating sample restaurants...');
  const restaurantData = [
    { nameAr: 'مطعم التك البرمجي', nameEn: 'Tak Software Restaurant', catIdx: 0 },
    { nameAr: 'بيتزا بريمو', nameEn: 'Pizza Primo', catIdx: 1 },
    { nameAr: 'سوشي هاوس', nameEn: 'Sushi House', catIdx: 7 },
    { nameAr: 'برجر كينج كونج', nameEn: 'Burger King Kong', catIdx: 0 },
    { nameAr: 'قصر الشواء', nameEn: 'Grill Palace', catIdx: 5 },
    { nameAr: 'حلويات الشرق', nameEn: 'Oriental Sweets', catIdx: 3 },
    { nameAr: 'هيلثي لايف', nameEn: 'Healthy Life', catIdx: 6 },
    { nameAr: 'سي فود جاردن', nameEn: 'Seafood Garden', catIdx: 2 }
  ];

  const createdRestaurants = [];
  for (let i = 0; i < restaurantData.length; i++) {
    const data = restaurantData[i];
    const res = await prisma.restaurant.create({
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        phone: `98765432${i}`,
        deliveryType: 'MOTORCYCLE',
        categoryId: categories[data.catIdx].id,
        ownerId: users[i % 5].id, // Distribute among first 5 users
        isActive: true,
        rating: 4.0 + (Math.random() * 1.0)
      }
    });
    createdRestaurants.push(res);
    console.log(`✅ Created Restaurant: ${res.nameEn}`);
  }

  const restaurant = createdRestaurants[0]; // Keep for backwards compatibility with the rest of the script

  // 6. Create 12 Subcategories
  console.log('Creating 12 subcategories...');
  const subcategories = [];
  for (let i = 1; i <= 12; i++) {
    const subcategory = await prisma.subcategory.create({
      data: {
        nameAr: `قسم فرعي ${i}`,
        nameEn: `Subcategory ${i}`,
        categoryId: categories[0].id,
        isActive: true
      }
    });
    subcategories.push(subcategory);
    console.log(`✅ Created Subcategory: ${subcategory.nameEn}`);
  }

  // 7. Create 12 Products
  console.log('Creating 12 products...');
  const products = [];
  for (let i = 0; i < 12; i++) {
    const product = await prisma.product.create({
      data: {
        nameAr: `منتج ${i + 1}`,
        nameEn: `Product ${i + 1}`,
        descriptionAr: `وصف المنتج ${i + 1}`,
        descriptionEn: `Description for Product ${i + 1}`,
        price: 10.0 + i * 5,
        calories: 200 + i * 50,
        restaurantId: restaurant.id,
        subcategoryId: subcategories[i].id,
        isAvailable: true
      }
    });
    products.push(product);
    console.log(`✅ Created Product: ${product.nameEn}`);
  }

  // 8. Create 10 Coupons
  console.log('Creating 10 coupons...');
  for (let i = 1; i <= 10; i++) {
    await prisma.coupon.create({
      data: {
        code: `SAVE${i}0`,
        discountType: 'PERCENTAGE',
        discountValue: 10.0 + i,
        minOrderAmount: 50.0,
        usageLimit: 100,
        startAt: new Date(),
        endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        restaurantId: restaurant.id,
        isActive: true
      }
    });
    console.log(`✅ Created Coupon: SAVE${i}0`);
  }

  // 9. Create 10 Offers (Promotions)
  console.log('Creating 10 offers...');
  for (let i = 1; i <= 10; i++) {
    const promotion = await prisma.promotion.create({
      data: {
        restaurantId: restaurant.id,
        type: 'DISCOUNT',
        discountType: i % 2 === 0 ? 'PERCENTAGE' : 'FIXED',
        discountValue: i % 2 === 0 ? 15.0 : 5.0,
        startAt: new Date(),
        endAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        isActive: true
      }
    });

    // Link promotion to the corresponding product
    await prisma.promotionProduct.create({
      data: {
        promotionId: promotion.id,
        productId: products[i - 1].id
      }
    });
    console.log(`✅ Created Offer for Product ${i}`);
  }

  // 10. Create 5 Delivery Drivers
  console.log('Creating 5 delivery drivers...');
  for (let i = 1; i <= 5; i++) {
    const driverUser = await prisma.user.create({
      data: {
        name: `Driver ${i}`,
        email: `driver${i}@example.com`,
        phone: `059999990${i}`,
        password: hashedPassword,
        roles: {
          create: { roleId: roleMap['DRIVER'] }
        }
      }
    });

    await prisma.deliveryDriver.create({
      data: {
        userId: driverUser.id,
        isOnline: true,
        rating: 4.5,
        isPlatformDriver: true
      }
    });
    console.log(`✅ Created Driver: ${driverUser.email}`);
  }

  // 11. Create 15 Sample Orders
  console.log('Creating 15 sample orders...');
  const statuses = ['pending', 'preparing', 'ready', 'on_the_way', 'delivered', 'cancelled'];
  const userAddresses = [];

  // Create some addresses for users first
  for (const user of users.slice(1)) { // skip owner
    const address = await prisma.userAddress.create({
      data: {
        userId: user.id,
        address: '123 Test St, City',
        lat: 24.7136,
        lng: 46.6753,
        type: 'home',
        isDefault: true
      }
    });
    userAddresses.push(address);
  }

  for (let i = 0; i < 15; i++) {
    const status = statuses[i % statuses.length];
    const user = users[1 + (i % 9)]; // users 2-10 are customers
    const address = userAddresses[i % userAddresses.length];
    const orderProducts = products.slice(0, 3); // random 3 products

    let total = 0;
    const orderItemsData = orderProducts.map(p => {
      const qty = Math.floor(Math.random() * 3) + 1;
      total += p.price * qty;
      return {
        productId: p.id,
        quantity: qty,
        price: p.price
      };
    });

    const order = await prisma.foodOrder.create({
      data: {
        userId: user.id,
        restaurantId: restaurant.id,
        addressId: address.id,
        status: status,
        totalPrice: total,
        notes: `Sample order ${i + 1}`,
        createdAt: new Date(Date.now() - (15 - i) * 24 * 60 * 60 * 1000), // Spaced out over 15 days
        items: {
          create: orderItemsData
        }
      }
    });

    // Create status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'pending',
        notes: 'Order placed'
      }
    });

    if (status !== 'pending') {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: status,
          notes: `Status updated to ${status}`
        }
      });
    }

    console.log(`✅ Created Order: ${order.id} (${status})`);
  }

  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
