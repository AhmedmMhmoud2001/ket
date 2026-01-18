const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Fetching categories and owners...');
        const categories = await prisma.category.findMany({ take: 5 });
        const owners = await prisma.user.findMany({
            where: {
                roles: {
                    some: {
                        role: {
                            name: 'RESTAURANT_OWNER'
                        }
                    }
                }
            },
            take: 5
        });

        console.log('Categories:', JSON.stringify(categories, null, 2));
        console.log('Owners:', JSON.stringify(owners, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
