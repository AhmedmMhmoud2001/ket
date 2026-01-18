const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding restaurants...');

    // Find a category and an owner
    const category = await prisma.category.findFirst({
        where: { type: 'RESTAURANT' }
    });

    const owner = await prisma.user.findFirst({
        where: {
            roles: {
                some: {
                    role: {
                        name: 'RESTAURANT_OWNER'
                    }
                }
            }
        }
    });

    if (!category || !owner) {
        console.error('Missing category or owner in database. Please create them first.');
        process.exit(1);
    }

    const categoryId = category.id;
    const ownerId = owner.id;

    console.log(`Using Category: ${category.nameEn} (ID: ${categoryId})`);
    console.log(`Using Owner: ${owner.name} (ID: ${ownerId})`);

    // 1. Burger Hut
    const burgerHut = await prisma.restaurant.create({
        data: {
            nameEn: 'Burger Hut',
            nameAr: 'كوخ البرجر',
            descriptionEn: 'The best burgers in town',
            descriptionAr: 'أفضل برجر في المدينة',
            phone: '123456789',
            deliveryType: 'MOTORCYCLE',
            categoryId,
            ownerId,
            imageUrl: '/uploads/restaurants/burger_hut.png',
            isActive: true
        }
    });

    const sub1 = await prisma.subcategory.create({
        data: {
            restaurantId: burgerHut.id,
            nameEn: 'Classic Burgers',
            nameAr: 'برجر كلاسيك',
            isActive: true
        }
    });

    await prisma.product.create({
        data: {
            restaurantId: burgerHut.id,
            subcategoryId: sub1.id,
            nameEn: 'Double Cheeseburger',
            nameAr: 'دبل تشيز برجر',
            descriptionEn: 'Juicy double beef patty with cheese',
            descriptionAr: 'قطعتين لحم بقري مع الجبن',
            price: 15.0,
            isAvailable: true,
            images: {
                create: [
                    { imageUrl: '/uploads/products/cheeseburger.png', isPrimary: true }
                ]
            }
        }
    });

    console.log('Created Burger Hut with items.');

    // 2. Pizza Palace
    const pizzaPalace = await prisma.restaurant.create({
        data: {
            nameEn: 'Pizza Palace',
            nameAr: 'قصر البيتزا',
            descriptionEn: 'Authentic Italian pizza',
            descriptionAr: 'بيتزا إيطالية أصلية',
            phone: '987654321',
            deliveryType: 'CAR',
            categoryId,
            ownerId,
            imageUrl: '/uploads/restaurants/pizza_palace.png',
            isActive: true
        }
    });

    const sub3 = await prisma.subcategory.create({
        data: {
            restaurantId: pizzaPalace.id,
            nameEn: 'Pizzas',
            nameAr: 'بيتزا',
            isActive: true
        }
    });

    await prisma.product.create({
        data: {
            restaurantId: pizzaPalace.id,
            subcategoryId: sub3.id,
            nameEn: 'Pepperoni Pizza',
            nameAr: 'بيتزا بيبروني',
            descriptionEn: 'Classic pepperoni and cheese',
            descriptionAr: 'بيبروني كلاسيك مع الجبن',
            price: 12.0,
            isAvailable: true,
            images: {
                create: [
                    { imageUrl: '/uploads/products/pizza.png', isPrimary: true }
                ]
            }
        }
    });

    console.log('Created Pizza Palace with items.');
    console.log('Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
