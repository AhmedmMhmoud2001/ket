/*
  Warnings:

  - You are about to drop the column `createdAt` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `sortOrder` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `coupon` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `coupon` table. All the data in the column will be lost.
  - You are about to drop the column `expiryDate` on the `coupon` table. All the data in the column will be lost.
  - You are about to drop the column `maxDiscount` on the `coupon` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `coupon` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `coupon` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `coupon` table. All the data in the column will be lost.
  - You are about to drop the column `usageLimitPerUser` on the `coupon` table. All the data in the column will be lost.
  - You are about to drop the column `userType` on the `coupon` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `couponusage` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `couponusage` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `discountedPrice` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `ingredients` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `isFeatured` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `sectionId` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `sortOrder` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `totalReviews` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `banner` on the `restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `closingTime` on the `restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `commissionRate` on the `restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryFee` on the `restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryRadius` on the `restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `isFreeDelivery` on the `restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `isOpen` on the `restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `managerId` on the `restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `minOrderAmount` on the `restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `openingTime` on the `restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `preparationTime` on the `restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `totalReviews` on the `restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `subcategory` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `subcategory` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `subcategory` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `subcategory` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `subcategory` table. All the data in the column will be lost.
  - You are about to drop the column `sortOrder` on the `subcategory` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `subcategory` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `phoneVerified` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `authproviderlink` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `driver` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `driverlocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `offer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orderitem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `otp` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `productextra` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `restaurantcategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `restaurantsection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `review` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `setting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tracking` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[couponId,userId,orderId]` on the table `CouponUsage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[adminId]` on the table `Restaurant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nameAr` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameEn` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountType` to the `Coupon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endAt` to the `Coupon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurantId` to the `Coupon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startAt` to the `Coupon` table without a default value. This is not possible if the table is not empty.
  - Made the column `usageLimit` on table `coupon` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `nameAr` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameEn` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Made the column `subcategoryId` on table `product` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `deliveryType` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameAr` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameEn` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameAr` to the `Subcategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameEn` to the `Subcategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurantId` to the `Subcategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `address` DROP FOREIGN KEY `Address_userId_fkey`;

-- DropForeignKey
ALTER TABLE `authproviderlink` DROP FOREIGN KEY `AuthProviderLink_userId_fkey`;

-- DropForeignKey
ALTER TABLE `couponusage` DROP FOREIGN KEY `CouponUsage_couponId_fkey`;

-- DropForeignKey
ALTER TABLE `couponusage` DROP FOREIGN KEY `CouponUsage_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `couponusage` DROP FOREIGN KEY `CouponUsage_userId_fkey`;

-- DropForeignKey
ALTER TABLE `driver` DROP FOREIGN KEY `Driver_userId_fkey`;

-- DropForeignKey
ALTER TABLE `driverlocation` DROP FOREIGN KEY `DriverLocation_driverId_fkey`;

-- DropForeignKey
ALTER TABLE `offer` DROP FOREIGN KEY `Offer_restaurantId_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_addressId_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_driverId_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_restaurantId_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_userId_fkey`;

-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `OrderItem_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `OrderItem_productId_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_sectionId_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_subcategoryId_fkey`;

-- DropForeignKey
ALTER TABLE `productextra` DROP FOREIGN KEY `ProductExtra_productId_fkey`;

-- DropForeignKey
ALTER TABLE `restaurant` DROP FOREIGN KEY `Restaurant_managerId_fkey`;

-- DropForeignKey
ALTER TABLE `restaurantcategory` DROP FOREIGN KEY `RestaurantCategory_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `restaurantcategory` DROP FOREIGN KEY `RestaurantCategory_restaurantId_fkey`;

-- DropForeignKey
ALTER TABLE `restaurantsection` DROP FOREIGN KEY `RestaurantSection_restaurantId_fkey`;

-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `Review_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `Review_productId_fkey`;

-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `Review_restaurantId_fkey`;

-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `Review_userId_fkey`;

-- DropForeignKey
ALTER TABLE `subcategory` DROP FOREIGN KEY `Subcategory_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `tracking` DROP FOREIGN KEY `Tracking_orderId_fkey`;

-- DropIndex
DROP INDEX `CouponUsage_orderId_key` ON `couponusage`;

-- DropIndex
DROP INDEX `Product_isFeatured_idx` ON `product`;

-- DropIndex
DROP INDEX `Product_slug_idx` ON `product`;

-- DropIndex
DROP INDEX `Restaurant_slug_idx` ON `restaurant`;

-- DropIndex
DROP INDEX `Restaurant_slug_key` ON `restaurant`;

-- DropIndex
DROP INDEX `Restaurant_status_idx` ON `restaurant`;

-- DropIndex
DROP INDEX `Subcategory_isActive_idx` ON `subcategory`;

-- DropIndex
DROP INDEX `User_role_idx` ON `user`;

-- AlterTable
ALTER TABLE `category` DROP COLUMN `createdAt`,
    DROP COLUMN `description`,
    DROP COLUMN `icon`,
    DROP COLUMN `image`,
    DROP COLUMN `name`,
    DROP COLUMN `sortOrder`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `nameAr` VARCHAR(191) NOT NULL,
    ADD COLUMN `nameEn` VARCHAR(191) NOT NULL,
    ADD COLUMN `type` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `coupon` DROP COLUMN `createdAt`,
    DROP COLUMN `description`,
    DROP COLUMN `expiryDate`,
    DROP COLUMN `maxDiscount`,
    DROP COLUMN `startDate`,
    DROP COLUMN `type`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `usageLimitPerUser`,
    DROP COLUMN `userType`,
    ADD COLUMN `discountType` VARCHAR(191) NOT NULL,
    ADD COLUMN `endAt` DATETIME(3) NOT NULL,
    ADD COLUMN `restaurantId` VARCHAR(191) NOT NULL,
    ADD COLUMN `startAt` DATETIME(3) NOT NULL,
    ADD COLUMN `usedCount` INTEGER NOT NULL DEFAULT 0,
    ALTER COLUMN `minOrderAmount` DROP DEFAULT,
    MODIFY `usageLimit` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `couponusage` DROP COLUMN `createdAt`,
    DROP COLUMN `discount`,
    ADD COLUMN `usedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `product` DROP COLUMN `categoryId`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `description`,
    DROP COLUMN `discountedPrice`,
    DROP COLUMN `images`,
    DROP COLUMN `ingredients`,
    DROP COLUMN `isFeatured`,
    DROP COLUMN `name`,
    DROP COLUMN `sectionId`,
    DROP COLUMN `slug`,
    DROP COLUMN `sortOrder`,
    DROP COLUMN `totalReviews`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `descriptionAr` TEXT NULL,
    ADD COLUMN `descriptionEn` TEXT NULL,
    ADD COLUMN `nameAr` VARCHAR(191) NOT NULL,
    ADD COLUMN `nameEn` VARCHAR(191) NOT NULL,
    MODIFY `subcategoryId` VARCHAR(191) NOT NULL,
    MODIFY `price` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `restaurant` DROP COLUMN `address`,
    DROP COLUMN `banner`,
    DROP COLUMN `closingTime`,
    DROP COLUMN `commissionRate`,
    DROP COLUMN `deliveryFee`,
    DROP COLUMN `deliveryRadius`,
    DROP COLUMN `description`,
    DROP COLUMN `email`,
    DROP COLUMN `isFreeDelivery`,
    DROP COLUMN `isOpen`,
    DROP COLUMN `latitude`,
    DROP COLUMN `logo`,
    DROP COLUMN `longitude`,
    DROP COLUMN `managerId`,
    DROP COLUMN `minOrderAmount`,
    DROP COLUMN `name`,
    DROP COLUMN `openingTime`,
    DROP COLUMN `preparationTime`,
    DROP COLUMN `slug`,
    DROP COLUMN `status`,
    DROP COLUMN `totalReviews`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `adminId` VARCHAR(191) NULL,
    ADD COLUMN `deliveryType` VARCHAR(191) NOT NULL,
    ADD COLUMN `descriptionAr` TEXT NULL,
    ADD COLUMN `descriptionEn` TEXT NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `nameAr` VARCHAR(191) NOT NULL,
    ADD COLUMN `nameEn` VARCHAR(191) NOT NULL,
    ADD COLUMN `ownerId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `subcategory` DROP COLUMN `categoryId`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `description`,
    DROP COLUMN `image`,
    DROP COLUMN `name`,
    DROP COLUMN `sortOrder`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `nameAr` VARCHAR(191) NOT NULL,
    ADD COLUMN `nameEn` VARCHAR(191) NOT NULL,
    ADD COLUMN `restaurantId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `avatar`,
    DROP COLUMN `emailVerified`,
    DROP COLUMN `firstName`,
    DROP COLUMN `lastLoginAt`,
    DROP COLUMN `lastName`,
    DROP COLUMN `phoneVerified`,
    DROP COLUMN `role`,
    DROP COLUMN `status`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `language` VARCHAR(191) NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `phone` VARCHAR(191) NOT NULL,
    MODIFY `password` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `address`;

-- DropTable
DROP TABLE `authproviderlink`;

-- DropTable
DROP TABLE `driver`;

-- DropTable
DROP TABLE `driverlocation`;

-- DropTable
DROP TABLE `notification`;

-- DropTable
DROP TABLE `offer`;

-- DropTable
DROP TABLE `order`;

-- DropTable
DROP TABLE `orderitem`;

-- DropTable
DROP TABLE `otp`;

-- DropTable
DROP TABLE `productextra`;

-- DropTable
DROP TABLE `restaurantcategory`;

-- DropTable
DROP TABLE `restaurantsection`;

-- DropTable
DROP TABLE `review`;

-- DropTable
DROP TABLE `setting`;

-- DropTable
DROP TABLE `tracking`;

-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Role_name_key`(`name`),
    INDEX `Role_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRole` (
    `userId` VARCHAR(191) NOT NULL,
    `roleId` INTEGER NOT NULL,

    PRIMARY KEY (`userId`, `roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserAddress` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `lat` DOUBLE NOT NULL,
    `lng` DOUBLE NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,

    INDEX `UserAddress_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductOption` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `nameAr` VARCHAR(191) NOT NULL,
    `nameEn` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    INDEX `ProductOption_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeliveryDriver` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NULL,
    `isPlatformDriver` BOOLEAN NOT NULL,
    `isOnline` BOOLEAN NOT NULL DEFAULT false,
    `rating` DOUBLE NOT NULL DEFAULT 0,

    UNIQUE INDEX `DeliveryDriver_userId_key`(`userId`),
    INDEX `DeliveryDriver_userId_idx`(`userId`),
    INDEX `DeliveryDriver_restaurantId_idx`(`restaurantId`),
    INDEX `DeliveryDriver_isOnline_idx`(`isOnline`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FoodOrder` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `driverId` VARCHAR(191) NULL,
    `addressId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `totalPrice` DOUBLE NOT NULL,
    `tip` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FoodOrder_userId_idx`(`userId`),
    INDEX `FoodOrder_restaurantId_idx`(`restaurantId`),
    INDEX `FoodOrder_driverId_idx`(`driverId`),
    INDEX `FoodOrder_status_idx`(`status`),
    INDEX `FoodOrder_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FoodOrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `foodOrderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,

    INDEX `FoodOrderItem_foodOrderId_idx`(`foodOrderId`),
    INDEX `FoodOrderItem_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShippingAgent` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `vehicleType` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `rating` DOUBLE NOT NULL DEFAULT 0,

    UNIQUE INDEX `ShippingAgent_userId_key`(`userId`),
    INDEX `ShippingAgent_userId_idx`(`userId`),
    INDEX `ShippingAgent_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShippingOrder` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `agentId` VARCHAR(191) NULL,
    `pickupLat` DOUBLE NOT NULL,
    `pickupLng` DOUBLE NOT NULL,
    `deliveryLat` DOUBLE NOT NULL,
    `deliveryLng` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `expectedCost` DOUBLE NOT NULL,
    `finalCost` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ShippingOrder_userId_idx`(`userId`),
    INDEX `ShippingOrder_agentId_idx`(`agentId`),
    INDEX `ShippingOrder_status_idx`(`status`),
    INDEX `ShippingOrder_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShippingOrderImage` (
    `id` VARCHAR(191) NOT NULL,
    `shippingOrderId` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,

    INDEX `ShippingOrderImage_shippingOrderId_idx`(`shippingOrderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chat` (
    `id` VARCHAR(191) NOT NULL,
    `orderType` VARCHAR(191) NOT NULL,
    `foodOrderId` VARCHAR(191) NULL,
    `shippingOrderId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Chat_foodOrderId_key`(`foodOrderId`),
    UNIQUE INDEX `Chat_shippingOrderId_key`(`shippingOrderId`),
    INDEX `Chat_orderType_idx`(`orderType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatParticipant` (
    `id` VARCHAR(191) NOT NULL,
    `chatId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,

    INDEX `ChatParticipant_chatId_idx`(`chatId`),
    INDEX `ChatParticipant_userId_idx`(`userId`),
    UNIQUE INDEX `ChatParticipant_chatId_userId_key`(`chatId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatMessage` (
    `id` VARCHAR(191) NOT NULL,
    `chatId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ChatMessage_chatId_idx`(`chatId`),
    INDEX `ChatMessage_senderId_idx`(`senderId`),
    INDEX `ChatMessage_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Promotion` (
    `id` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `discountType` VARCHAR(191) NOT NULL,
    `discountValue` DOUBLE NOT NULL,
    `startAt` DATETIME(3) NOT NULL,
    `endAt` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Promotion_restaurantId_idx`(`restaurantId`),
    INDEX `Promotion_isActive_idx`(`isActive`),
    INDEX `Promotion_startAt_endAt_idx`(`startAt`, `endAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PromotionProduct` (
    `id` VARCHAR(191) NOT NULL,
    `promotionId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `PromotionProduct_promotionId_productId_key`(`promotionId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FavoriteRestaurant` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FavoriteRestaurant_userId_idx`(`userId`),
    INDEX `FavoriteRestaurant_restaurantId_idx`(`restaurantId`),
    UNIQUE INDEX `FavoriteRestaurant_userId_restaurantId_key`(`userId`, `restaurantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FavoriteProduct` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FavoriteProduct_userId_idx`(`userId`),
    INDEX `FavoriteProduct_productId_idx`(`productId`),
    UNIQUE INDEX `FavoriteProduct_userId_productId_key`(`userId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rating` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `targetType` VARCHAR(191) NOT NULL,
    `targetId` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Rating_userId_idx`(`userId`),
    INDEX `Rating_targetType_targetId_idx`(`targetType`, `targetId`),
    INDEX `Rating_rating_idx`(`rating`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SupportTicket` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `orderType` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SupportTicket_userId_idx`(`userId`),
    INDEX `SupportTicket_status_idx`(`status`),
    INDEX `SupportTicket_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `orderType` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Payment_userId_idx`(`userId`),
    INDEX `Payment_orderType_orderId_idx`(`orderType`, `orderId`),
    INDEX `Payment_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActivityLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ActivityLog_userId_idx`(`userId`),
    INDEX `ActivityLog_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `ActivityLog_action_idx`(`action`),
    INDEX `ActivityLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Category_type_idx` ON `Category`(`type`);

-- CreateIndex
CREATE INDEX `Coupon_restaurantId_idx` ON `Coupon`(`restaurantId`);

-- CreateIndex
CREATE UNIQUE INDEX `CouponUsage_couponId_userId_orderId_key` ON `CouponUsage`(`couponId`, `userId`, `orderId`);

-- CreateIndex
CREATE INDEX `Product_isAvailable_idx` ON `Product`(`isAvailable`);

-- CreateIndex
CREATE UNIQUE INDEX `Restaurant_adminId_key` ON `Restaurant`(`adminId`);

-- CreateIndex
CREATE INDEX `Restaurant_ownerId_idx` ON `Restaurant`(`ownerId`);

-- CreateIndex
CREATE INDEX `Restaurant_isActive_idx` ON `Restaurant`(`isActive`);

-- CreateIndex
CREATE INDEX `Subcategory_restaurantId_idx` ON `Subcategory`(`restaurantId`);

-- AddForeignKey
ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAddress` ADD CONSTRAINT `UserAddress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Restaurant` ADD CONSTRAINT `Restaurant_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Restaurant` ADD CONSTRAINT `Restaurant_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subcategory` ADD CONSTRAINT `Subcategory_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_subcategoryId_fkey` FOREIGN KEY (`subcategoryId`) REFERENCES `Subcategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductOption` ADD CONSTRAINT `ProductOption_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryDriver` ADD CONSTRAINT `DeliveryDriver_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryDriver` ADD CONSTRAINT `DeliveryDriver_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FoodOrder` ADD CONSTRAINT `FoodOrder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FoodOrder` ADD CONSTRAINT `FoodOrder_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FoodOrder` ADD CONSTRAINT `FoodOrder_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `DeliveryDriver`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FoodOrderItem` ADD CONSTRAINT `FoodOrderItem_foodOrderId_fkey` FOREIGN KEY (`foodOrderId`) REFERENCES `FoodOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FoodOrderItem` ADD CONSTRAINT `FoodOrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShippingAgent` ADD CONSTRAINT `ShippingAgent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShippingOrder` ADD CONSTRAINT `ShippingOrder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShippingOrder` ADD CONSTRAINT `ShippingOrder_agentId_fkey` FOREIGN KEY (`agentId`) REFERENCES `ShippingAgent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShippingOrderImage` ADD CONSTRAINT `ShippingOrderImage_shippingOrderId_fkey` FOREIGN KEY (`shippingOrderId`) REFERENCES `ShippingOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_foodOrderId_fkey` FOREIGN KEY (`foodOrderId`) REFERENCES `FoodOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_shippingOrderId_fkey` FOREIGN KEY (`shippingOrderId`) REFERENCES `ShippingOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatParticipant` ADD CONSTRAINT `ChatParticipant_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatParticipant` ADD CONSTRAINT `ChatParticipant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Promotion` ADD CONSTRAINT `Promotion_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromotionProduct` ADD CONSTRAINT `PromotionProduct_promotionId_fkey` FOREIGN KEY (`promotionId`) REFERENCES `Promotion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromotionProduct` ADD CONSTRAINT `PromotionProduct_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Coupon` ADD CONSTRAINT `Coupon_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CouponUsage` ADD CONSTRAINT `CouponUsage_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `Coupon`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CouponUsage` ADD CONSTRAINT `CouponUsage_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CouponUsage` ADD CONSTRAINT `CouponUsage_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `FoodOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavoriteRestaurant` ADD CONSTRAINT `FavoriteRestaurant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavoriteRestaurant` ADD CONSTRAINT `FavoriteRestaurant_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavoriteProduct` ADD CONSTRAINT `FavoriteProduct_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavoriteProduct` ADD CONSTRAINT `FavoriteProduct_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rating` ADD CONSTRAINT `Rating_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportTicket` ADD CONSTRAINT `SupportTicket_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityLog` ADD CONSTRAINT `ActivityLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
