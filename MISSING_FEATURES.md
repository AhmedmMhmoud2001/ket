# 📋 Missing Features Analysis: Figma Design vs Current Schema

This document compares the Figma design requirements with the current Prisma schema and identifies missing features and functionalities.

## 📱 Mobile App Features from Figma

### ✅ Implemented in Schema
1. **User Management** ✅
   - User authentication (phone, email)
   - User roles and permissions
   - User addresses

2. **Restaurant System** ✅
   - Restaurants with categories
   - Products and subcategories
   - Product options

3. **Food Orders** ✅
   - Food orders with items
   - Order status tracking
   - Delivery drivers

4. **Shipping System** ✅
   - Shipping agents
   - Shipping orders
   - Shipping order images

5. **Chat System** ✅
   - Chat between users/drivers/agents
   - Chat messages
   - Chat participants

6. **Promotions & Coupons** ✅
   - Promotions/Offers
   - Coupons with usage tracking
   - Coupon usage history

7. **Ratings & Reviews** ✅
   - Rating system
   - Comments on ratings

8. **Support System** ✅
   - Support tickets

9. **Payments** ✅
   - Payment records
   - Payment methods tracking

10. **Favorites** ✅
    - Favorite restaurants
    - Favorite products

11. **Activity Logs** ✅
    - User activity tracking

---

## ❌ Missing Features from Figma Design

### 1. **Points/Rewards System (نقاط)**
**Status:** ❌ Missing from Schema

**Figma Evidence:**
- Points display (500 نقطة)
- Points expiration warnings (63 نقطة تنتهي صلاحيتها في 12 فبراير 2024)
- Points redemption for discounts
- Points earning from orders

**Required Schema:**
```prisma
model UserPoints {
  id            String   @id @default(uuid())
  userId        String
  points        Int      @default(0)
  earnedPoints  Int      @default(0)
  usedPoints    Int      @default(0)
  expiresAt     DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}

model PointsTransaction {
  id          String   @id @default(uuid())
  userId      String
  orderId     String?
  points      Int
  type        String   // 'earned', 'used', 'expired', 'reward'
  description String?
  createdAt   DateTime @default(now())

  user  User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  order FoodOrder? @relation(fields: [orderId], references: [id])

  @@index([userId])
  @@index([orderId])
  @@index([type])
}
```

**Required Backend:**
- `GET /api/points` - Get user points
- `GET /api/points/transactions` - Get points history
- `POST /api/points/redeem` - Redeem points
- `POST /api/orders/:id/earn-points` - Award points after order completion

**Required Frontend:**
- Points display page (Vouchers/Points page)
- Points history/transactions page
- Points redemption in checkout

---

### 2. **Product Images**
**Status:** ❌ Missing from Schema

**Figma Evidence:**
- Products have images displayed
- Product detail pages show product images
- Multiple images per product may be needed

**Required Schema:**
```prisma
model ProductImage {
  id        String   @id @default(uuid())
  productId String
  imageUrl  String
  isPrimary Boolean  @default(false)
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
  @@index([isPrimary])
}
```

**Current Issue:**
- Product model doesn't have an `imageUrl` field
- No way to store multiple images per product

---

### 3. **Cart/Shopping Cart**
**Status:** ❌ Missing from Schema

**Figma Evidence:**
- Cart page with multiple items
- Add to cart functionality
- Quantity management in cart
- Cart persistence

**Required Schema:**
```prisma
model Cart {
  id        String   @id @default(uuid())
  userId    String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user  User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  items CartItem[]

  @@index([userId])
}

model CartItem {
  id        String   @id @default(uuid())
  cartId    String
  productId String
  quantity  Int
  options   Json?    // Selected product options
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  cart    Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([cartId, productId])
  @@index([cartId])
  @@index([productId])
}
```

**Required Backend:**
- `GET /api/cart` - Get user cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item quantity
- `DELETE /api/cart/items/:id` - Remove item from cart
- `POST /api/cart/checkout` - Convert cart to order

**Required Frontend:**
- Cart page (already exists in Figma)

---

### 4. **Order Items with Product Options**
**Status:** ⚠️ Partially Missing

**Current Schema:**
- `FoodOrderItem` exists but doesn't store selected options

**Figma Evidence:**
- Product options selection (e.g., sauce choices)
- Order items should remember selected options
- Options can have prices

**Required Schema Update:**
```prisma
model FoodOrderItem {
  id          String @id @default(uuid())
  foodOrderId String
  productId   String
  quantity    Int
  price       Float
  selectedOptions Json? // Store selected ProductOption IDs with quantities
  
  order   FoodOrder @relation(fields: [foodOrderId], references: [id], onDelete: Cascade)
  product Product   @relation(fields: [productId], references: [id])

  @@index([foodOrderId])
  @@index([productId])
}
```

---

### 5. **Delivery Fees & Tips**
**Status:** ⚠️ Partially Missing

**Figma Evidence:**
- Delivery fee displayed (69.00 دينار)
- Tip/driver tip system (إكرامية السائق)
- Tip options (1 د.ك, 0.700 د.ك, 0.350 د.ك)
- "Use tip for next order" option

**Current Schema:**
- `FoodOrder.tip` exists but no tip management system

**Required Schema:**
```prisma
model DeliveryFee {
  id            String   @id @default(uuid())
  restaurantId  String?  // null for platform-wide fees
  baseFee       Float
  distanceFee   Float?   // per km
  minOrderValue Float?   // minimum order for free delivery
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())

  restaurant Restaurant? @relation(fields: [restaurantId], references: [id])

  @@index([restaurantId])
}

model OrderTip {
  id          String   @id @default(uuid())
  orderId     String   @unique
  amount      Float
  savedForNext Boolean @default(false)
  createdAt   DateTime @default(now())

  order FoodOrder @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId])
}
```

---

### 6. **Address Details & Management**
**Status:** ⚠️ Basic Implementation Only

**Figma Evidence:**
- Multiple saved addresses
- Address types (home, work, office)
- Address selection for delivery
- Map-based address selection
- Phone number per address

**Current Schema:**
- `UserAddress` exists but missing fields

**Required Schema Update:**
```prisma
model UserAddress {
  id          String   @id @default(uuid())
  userId      String
  type        String?  // 'home', 'work', 'office', 'other'
  label       String?  // e.g., "شقة", "مكتب"
  address     String
  lat         Float
  lng         Float
  phone       String?  // Optional phone for this address
  building    String?
  floor       String?
  apartment   String?
  notes       String?
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([isDefault])
}
```

---

### 7. **Order Notes/Comments**
**Status:** ❌ Missing from Schema

**Figma Evidence:**
- Order notes/comments field (ملاحظات)
- Text input for order instructions

**Required Schema Update:**
```prisma
model FoodOrder {
  // ... existing fields
  notes     String?  // Customer notes/instructions
  // ... rest of fields
}
```

---

### 8. **Order Status History/Timeline**
**Status:** ❌ Missing from Schema

**Figma Evidence:**
- Order status tracking with timeline
- Status change timestamps
- Expected delivery time display

**Required Schema:**
```prisma
model OrderStatusHistory {
  id          String   @id @default(uuid())
  orderId     String
  status      String
  userId      String?  // Who changed the status
  notes       String?
  expectedAt  DateTime? // Expected completion time
  createdAt   DateTime @default(now())

  order FoodOrder @relation(fields: [orderId], references: [id], onDelete: Cascade)
  user  User?     @relation(fields: [userId], references: [id])

  @@index([orderId])
  @@index([status])
  @@index([createdAt])
}
```

---

### 9. **Notification System**
**Status:** ⚠️ Schema Missing, Backend Route Exists

**Figma Evidence:**
- Order notifications
- Status update notifications
- Push notifications mentioned

**Required Schema:**
```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String
  type      String   // 'order', 'status', 'promotion', 'system'
  title     String
  message   String
  data      Json?    // Additional data
  isRead    Boolean  @default(false)
  orderId   String?  // Related order if applicable
  createdAt DateTime @default(now())

  user  User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  order FoodOrder? @relation(fields: [orderId], references: [id])

  @@index([userId])
  @@index([isRead])
  @@index([type])
  @@index([createdAt])
}
```

---

### 10. **Restaurant Operating Hours**
**Status:** ❌ Missing from Schema

**Figma Evidence:**
- Delivery time estimation (60 دقيقة)
- Restaurant availability

**Required Schema:**
```prisma
model RestaurantHours {
  id          String   @id @default(uuid())
  restaurantId String
  dayOfWeek   Int      // 0-6 (Sunday-Saturday)
  openTime    String   // e.g., "09:00"
  closeTime   String   // e.g., "22:00"
  isOpen      Boolean  @default(true)
  createdAt   DateTime @default(now())

  restaurant Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

  @@unique([restaurantId, dayOfWeek])
  @@index([restaurantId])
}
```

---

### 11. **Delivery Time Estimation**
**Status:** ❌ Missing Logic

**Figma Evidence:**
- Estimated delivery time (60 دقيقة)
- Expected time range display

**Required Schema:**
```prisma
model DeliveryTimeEstimate {
  id            String   @id @default(uuid())
  restaurantId  String?
  baseTime      Int      // Base minutes
  perKmTime     Int?     // Additional minutes per km
  busyTimeAdd   Int?     // Additional minutes during busy hours
  createdAt     DateTime @default(now())

  restaurant Restaurant? @relation(fields: [restaurantId], references: [id])

  @@index([restaurantId])
}
```

---

### 12. **Payment Methods Details**
**Status:** ⚠️ Basic Implementation Only

**Figma Evidence:**
- Multiple payment methods:
  - Cash (كاش)
  - Credit/Debit Card (بطاقة ائتمان)
  - Google Pay
  - K-Net
- Saved payment methods
- Payment method selection

**Current Schema:**
- `Payment.method` exists but no payment method management

**Required Schema:**
```prisma
model PaymentMethod {
  id          String   @id @default(uuid())
  userId      String
  type        String   // 'card', 'wallet', 'cash'
  provider    String?  // 'visa', 'mastercard', 'google_pay', 'k_net'
  last4       String?  // Last 4 digits for cards
  expiryMonth Int?
  expiryYear  Int?
  isDefault   Boolean  @default(false)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([isDefault])
}
```

---

### 13. **Driver Real-Time Location**
**Status:** ❌ Missing from Schema

**Figma Evidence:**
- Real-time driver location on map
- Order tracking with driver position

**Required Schema:**
```prisma
model DriverLocation {
  id        String   @id @default(uuid())
  driverId  String
  lat       Float
  lng       Float
  heading   Float?   // Compass heading
  speed     Float?   // Speed in km/h
  updatedAt DateTime @updatedAt

  driver DeliveryDriver @relation(fields: [driverId], references: [id], onDelete: Cascade)

  @@unique([driverId])
  @@index([driverId])
}
```

---

### 14. **Order Cancellation Reasons**
**Status:** ❌ Missing from Schema

**Figma Evidence:**
- Cancel order option
- Cancellation flow

**Required Schema Update:**
```prisma
model FoodOrder {
  // ... existing fields
  cancelledAt   DateTime?
  cancelReason  String?
  cancelledBy   String?  // 'customer', 'restaurant', 'admin'
  // ... rest of fields
}
```

---

### 15. **Multi-Language Support Metadata**
**Status:** ⚠️ Partially Implemented

**Figma Evidence:**
- Language selection (العربية, English)
- RTL support for Arabic
- All text in both languages

**Current Schema:**
- `nameAr` and `nameEn` fields exist for most models
- `User.language` exists
- But missing for some models like `User.name` (should be `nameAr` and `nameEn`)

**Required Schema Update:**
```prisma
model User {
  // ... existing fields
  nameAr  String?  // Arabic name
  nameEn  String?  // English name
  name    String   // Keep for backward compatibility, use nameAr or nameEn
  // ... rest of fields
}
```

---

### 16. **Restaurant Delivery Zones/Areas**
**Status:** ❌ Missing from Schema

**Figma Evidence:**
- Restaurant location display
- Distance calculation
- Delivery availability per area

**Required Schema:**
```prisma
model DeliveryZone {
  id          String   @id @default(uuid())
  restaurantId String
  name        String
  coordinates Json     // Polygon coordinates
  isActive    Boolean  @default(true)
  fee         Float?   // Delivery fee for this zone
  minOrder    Float?   // Minimum order for this zone
  createdAt   DateTime @default(now())

  restaurant Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

  @@index([restaurantId])
}
```

---

### 17. **Product Nutrition Information**
**Status:** ⚠️ Partially Missing

**Figma Evidence:**
- Calories display (1500 kcal)
- Cooking time (15 - 20)

**Current Schema:**
- `Product.calories` exists
- Missing: cooking time, nutrition details

**Required Schema Update:**
```prisma
model Product {
  // ... existing fields
  calories    Int?
  cookingTime Int?    // Cooking time in minutes
  nutritionInfo Json? // Extended nutrition information
  // ... rest of fields
}
```

---

### 18. **Order Reordering (Order Again)**
**Status:** ❌ Missing Feature

**Figma Evidence:**
- "Order Again" button in My Orders
- Quick reorder functionality

**Required Backend:**
- `POST /api/orders/:id/reorder` - Create new order from previous order

---

### 19. **Promotion/Discount Display**
**Status:** ⚠️ Schema Exists but Missing Display Logic

**Figma Evidence:**
- Discount badges (خصم 70%)
- Promotion display on restaurant cards
- Promotion application in checkout

**Required Backend:**
- Enhanced promotion calculation
- Promotion display endpoints

---

### 20. **Support Chat Integration with Orders**
**Status:** ⚠️ Basic Implementation

**Figma Evidence:**
- Chat integrated with order tracking
- Support chat separate from order chat

**Current Schema:**
- `Chat` links to orders
- `SupportTicket` exists separately
- Need better integration

---

## 🎯 Priority Recommendations

### High Priority (Core Features)
1. **Cart System** - Essential for order flow
2. **Product Images** - Critical for product display
3. **Points/Rewards System** - Major feature in design
4. **Order Notes** - Important for customer experience
5. **Notification System** - Essential for user engagement

### Medium Priority
6. **Delivery Fees & Tips** - Important for pricing
7. **Address Management** - Enhanced address features
8. **Payment Methods** - Saved payment methods
9. **Order Status History** - Better tracking
10. **Driver Location** - Real-time tracking

### Low Priority (Enhancements)
11. **Restaurant Hours** - Nice to have
12. **Delivery Zones** - Advanced feature
13. **Nutrition Info** - Extra detail
14. **Order Reordering** - Convenience feature

---

## 📝 Implementation Notes

### Database Migration Strategy
1. Create new models for missing features
2. Add nullable fields to existing models where possible
3. Run migrations incrementally
4. Update Prisma client after each migration

### Backend Implementation Order
1. Cart system (blocks order creation)
2. Product images (blocks product display)
3. Points system (independent feature)
4. Notifications (enhances existing features)
5. Enhanced address/payment (improves UX)

### Frontend Implementation Order
1. Product images display
2. Cart page and functionality
3. Points/Vouchers page
4. Enhanced checkout with tips
5. Notification center

---

## 🔍 Schema Validation Checklist

- [ ] All Figma screens have corresponding data models
- [ ] All user interactions can be saved to database
- [ ] Order flow is complete (Cart → Checkout → Payment → Delivery)
- [ ] Points system fully implemented
- [ ] Notifications can be stored and retrieved
- [ ] Real-time features have supporting data models
- [ ] Multi-language support is comprehensive
- [ ] Payment methods are fully managed

---

## 📚 Additional Notes

1. **OTP System**: Design shows OTP verification, ensure backend supports this
2. **Social Login**: Google/Apple login shown in design, verify implementation
3. **Map Integration**: Many screens show maps, ensure location services are integrated
4. **Image Upload**: Product images, shipping order images need upload functionality
5. **Real-time Updates**: Socket.io integration needed for order tracking

---

*Last Updated: [Current Date]*
*Based on Figma Design: [Figma URL]*
*Schema Version: Prisma Schema as of [Date]*

