-- AlterTable
ALTER TABLE `order` MODIFY `subtotal` FLOAT NOT NULL,
    MODIFY `deliveryFee` FLOAT NOT NULL,
    MODIFY `discount` FLOAT NOT NULL DEFAULT 0,
    MODIFY `tax` FLOAT NOT NULL DEFAULT 0,
    MODIFY `total` FLOAT NOT NULL;

-- AlterTable
ALTER TABLE `product` MODIFY `price` FLOAT NOT NULL,
    MODIFY `discountedPrice` FLOAT NULL;

-- AlterTable
ALTER TABLE `productextra` MODIFY `price` FLOAT NOT NULL;

-- AlterTable
ALTER TABLE `restaurant` MODIFY `deliveryFee` FLOAT NOT NULL DEFAULT 0,
    MODIFY `minOrderAmount` FLOAT NOT NULL DEFAULT 0,
    MODIFY `deliveryRadius` FLOAT NOT NULL DEFAULT 5,
    MODIFY `commissionRate` FLOAT NOT NULL DEFAULT 10;

-- CreateTable
CREATE TABLE `RestaurantCategory` (
    `restaurantId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RestaurantCategory_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`restaurantId`, `categoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RestaurantCategory` ADD CONSTRAINT `RestaurantCategory_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RestaurantCategory` ADD CONSTRAINT `RestaurantCategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
