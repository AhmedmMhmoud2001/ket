# API Endpoints Documentation

Base URL: `http://localhost:5000/api`

## Authentication

### Register
- **POST** `/api/auth/register`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

### Login
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Google Login
- **POST** `/api/auth/google`
- **Body:**
```json
{
  "token": "google_id_token"
}
```

### Apple Login
- **POST** `/api/auth/apple`
- **Body:**
```json
{
  "token": "apple_id_token"
}
```

### Send OTP
- **POST** `http://localhost:5000/api/auth/send-otp`
- **Body:**
```json
{
  "phone": "+1234567890"
}
{
  "phone": "01002265274",
  "method": "whats app"
}
{
  "phone": "01002265274",
  "method": "sms"
}
```

### Verify OTP
- **POST** `/api/auth/verify-otp`
- **Body:**
```json
{
  "phone": "+1234567890",
  "code": "123456"
}
```

### Get Current User
- **GET** `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`

### Update Profile
- **PUT** `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "avatar": "url"
}
// <!-- ```

// ### Change Password
// - **POST** `/api/auth/change-password`
// - **Headers:** `Authorization: Bearer <token>`
// - **Body:**
// ```json
// {
//   "currentPassword": "oldpassword",
//   "newPassword": "newpassword"
// }
// ``` -->

---

## Users

### Get All Users
- **GET** `/api/users`
- **Headers:** `Authorization: Bearer <token>`
- **Query:** `?role=admin&status=ACTIVE&page=1&limit=20`

### Get All Customers
- **GET** `/api/users/customers`
- **Headers:** `Authorization: Bearer <token>`
- **Query:** `?status=ACTIVE&page=1&limit=20`

### Create Customer
- **POST** `/api/users/customers`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "email": "customer@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "CUSTOMER"
}
```

### Update Customer
- **PUT** `/api/users/customers/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

### Update Customer Status
- **PATCH** `/api/users/customers/:id/status`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "status": "ACTIVE"
}
```

### Get User By ID
- **GET** `/api/users/:id`
- **Headers:** `Authorization: Bearer <token>`

### Update User
- **PUT** `/api/users/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "role": "CUSTOMER"
}
```

### Update User Status
- **PATCH** `/api/users/:id/status`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "status": "ACTIVE"
}
```

### Delete User
- **DELETE** `/api/users/:id`
- **Headers:** `Authorization: Bearer <token>`

### Get User Orders
- **GET** `/api/users/:id/orders`
- **Headers:** `Authorization: Bearer <token>`

---

## Restaurants

### Get All Restaurants
- **GET** `/api/restaurants`
- **Headers:** `Authorization: Bearer <token>`
- **Query:** `?is_active=true&page=1&limit=20`

### Get Restaurant By ID
- **GET** `/api/restaurants/:id`
- **Headers:** `Authorization: Bearer <token>`

### Create Restaurant
- **POST** `/api/restaurants`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "name": "Restaurant Name",
  "nameAr": "اسم المطعم",
  "description": "Description",
  "descriptionAr": "الوصف",
  "phone": "+1234567890",
  "email": "restaurant@example.com",
  "address": "Address",
  "latitude": 25.1234,
  "longitude": 45.6789,
  "deliveryFee": 10,
  "deliveryRadius": 5,
  "isActive": true,
  "categoryIds": ["category-id-1", "category-id-2"]
}
```

### Update Restaurant
- **PUT** `/api/restaurants/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Same as create

### Toggle Free Delivery
- **PATCH** `/api/restaurants/:id/free-delivery`
- **Headers:** `Authorization: Bearer <token>`

### Delete Restaurant
- **DELETE** `/api/restaurants/:id`
- **Headers:** `Authorization: Bearer <token>`

### Get Restaurant Products
- **GET** `/api/restaurants/:id/products`
- **Headers:** `Authorization: Bearer <token>`

### Delete Restaurant Image
- **DELETE** `/api/restaurants/:id/image`
- **Headers:** `Authorization: Bearer <token>`

---

## Products

### Get All Products
- **GET** `/api/products`
- **Headers:** `Authorization: Bearer <token>`
- **Query:** `?restaurant_id=xxx&category_id=xxx&page=1&limit=20`

### Get Product By ID
- **GET** `/api/products/:id`
- **Headers:** `Authorization: Bearer <token>`

### Create Product
- **POST** `/api/products`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "name": "Product Name",
  "nameAr": "اسم المنتج",
  "description": "Description",
  "descriptionAr": "الوصف",
  "price": 25.99,
  "restaurantId": "restaurant-id",
  "categoryId": "category-id",
  "subcategoryId": "subcategory-id",
  "images": ["url1", "url2"],
  "isActive": true
}
```

### Update Product
- **PUT** `/api/products/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Same as create

### Delete Product
- **DELETE** `/api/products/:id`
- **Headers:** `Authorization: Bearer <token>`

### Get Product Reviews
- **GET** `/api/products/:id/reviews`
- **Headers:** `Authorization: Bearer <token>`

---

## Orders

### Get All Orders
- **GET** `/api/orders`
- **Headers:** `Authorization: Bearer <token>`
- **Query:** `?status=PENDING&payment_status=PAID&search=xxx&page=1&limit=20`

### Get Order Statistics
- **GET** `/api/orders/stats`
- **Headers:** `Authorization: Bearer <token>`

### Get Order By ID
- **GET** `/api/orders/:id`
- **Headers:** `Authorization: Bearer <token>`

### Update Order Status
- **PATCH** `/api/orders/:id/status`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "status": "DELIVERED"
}
```

### Update Payment Status
- **PATCH** `/api/orders/:id/payment-status`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "payment_status": "PAID"
}
```

### Assign Driver
- **PATCH** `/api/orders/:id/assign-driver`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "driver_id": "driver-id"
}
```

### Get Order Tracking
- **GET** `/api/orders/:id/tracking`
- **Headers:** `Authorization: Bearer <token>`

---

## Categories

### Get All Categories
- **GET** `/api/categories`
- **Headers:** `Authorization: Bearer <token>`

### Get Category By ID
- **GET** `/api/categories/:id`
- **Headers:** `Authorization: Bearer <token>`

### Create Category
- **POST** `/api/categories`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "name": "Category Name",
  "nameAr": "اسم الفئة",
  "image": "image-url",
  "isActive": true
}
```

### Update Category
- **PUT** `/api/categories/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Same as create

### Toggle Category
- **PATCH** `/api/categories/:id/toggle`
- **Headers:** `Authorization: Bearer <token>`

### Delete Category
- **DELETE** `/api/categories/:id`
- **Headers:** `Authorization: Bearer <token>`

---

## Subcategories

### Get All Subcategories
- **GET** `/api/subcategories`
- **Headers:** `Authorization: Bearer <token>`
- **Query:** `?category_id=xxx`

### Get Subcategory By ID
- **GET** `/api/subcategories/:id`
- **Headers:** `Authorization: Bearer <token>`

### Create Subcategory
- **POST** `/api/subcategories`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "name": "Subcategory Name",
  "nameAr": "اسم الفئة الفرعية",
  "categoryId": "category-id",
  "isActive": true
}
```

### Update Subcategory
- **PUT** `/api/subcategories/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Same as create

### Toggle Subcategory
- **PATCH** `/api/subcategories/:id/toggle`
- **Headers:** `Authorization: Bearer <token>`

### Delete Subcategory
- **DELETE** `/api/subcategories/:id`
- **Headers:** `Authorization: Bearer <token>`

---

## Offers

### Get All Offers
- **GET** `/api/offers`
- **Headers:** `Authorization: Bearer <token>`
- **Query:** `?search=xxx&restaurant_id=xxx&is_active=true&page=1&limit=10`

### Get Offer By ID
- **GET** `/api/offers/:id`
- **Headers:** `Authorization: Bearer <token>`

### Create Offer
- **POST** `/api/offers`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "title": "Offer Title",
  "title_ar": "عنوان العرض",
  "description": "Description",
  "description_ar": "الوصف",
  "image_url": "image-url",
  "discount_type": "PERCENTAGE",
  "discount_value": 20,
  "min_order_amount": 50,
  "restaurant_id": "restaurant-id",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "is_active": true
}
```

### Update Offer
- **PUT** `/api/offers/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Same as create

### Delete Offer
- **DELETE** `/api/offers/:id`
- **Headers:** `Authorization: Bearer <token>`

---

## Coupons

### Get All Coupons
- **GET** `/api/coupons`
- **Headers:** `Authorization: Bearer <token>`
- **Query:** `?search=xxx&is_active=true&page=1&limit=10`

### Get Coupon By ID
- **GET** `/api/coupons/:id`
- **Headers:** `Authorization: Bearer <token>`

### Create Coupon
- **POST** `/api/coupons`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "code": "SAVE20",
  "description": "20% off",
  "discount_type": "percentage",
  "discount_value": 20,
  "min_order_amount": 50,
  "max_discount_amount": 100,
  "usage_limit": 100,
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "is_active": true
}
```

### Update Coupon
- **PUT** `/api/coupons/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Same as create

### Delete Coupon
- **DELETE** `/api/coupons/:id`
- **Headers:** `Authorization: Bearer <token>`

---

## Drivers

### Get All Drivers
- **GET** `/api/drivers`
- **Headers:** `Authorization: Bearer <token>`

### Get Driver By ID
- **GET** `/api/drivers/:id`
- **Headers:** `Authorization: Bearer <token>`

### Create Driver
- **POST** `/api/drivers`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "userId": "user-id",
  "vehicleType": "CAR",
  "licensePlate": "ABC123",
  "licenseNumber": "LIC123456"
}
```

### Update Driver
- **PUT** `/api/drivers/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Same as create

### Delete Driver
- **DELETE** `/api/drivers/:id`
- **Headers:** `Authorization: Bearer <token>`

---

## Favorites

### Get User Favorite Products
- **GET** `/api/favorites/products`
- **Headers:** `Authorization: Bearer <token>`

### Add Product to Favorites
- **POST** `/api/favorites/products/:productId`
- **Headers:** `Authorization: Bearer <token>`

### Remove Product from Favorites
- **DELETE** `/api/favorites/products/:productId`
- **Headers:** `Authorization: Bearer <token>`

### Get Product Favorite Users (Admin)
- **GET** `/api/favorites/products/:productId/users`
- **Headers:** `Authorization: Bearer <token>`

### Get Product Favorites Count
- **GET** `/api/favorites/products/:productId/count`
- **Headers:** `Authorization: Bearer <token>`

### Get User Favorite Restaurants
- **GET** `/api/favorites/restaurants`
- **Headers:** `Authorization: Bearer <token>`

### Add Restaurant to Favorites
- **POST** `/api/favorites/restaurants/:restaurantId`
- **Headers:** `Authorization: Bearer <token>`

### Remove Restaurant from Favorites
- **DELETE** `/api/favorites/restaurants/:restaurantId`
- **Headers:** `Authorization: Bearer <token>`

### Get Restaurant Favorite Users (Admin)
- **GET** `/api/favorites/restaurants/:restaurantId/users`
- **Headers:** `Authorization: Bearer <token>`

### Get Restaurant Favorites Count
- **GET** `/api/favorites/restaurants/:restaurantId/count`
- **Headers:** `Authorization: Bearer <token>`

---

## Upload

### Upload Restaurant Images
- **POST** `/api/upload/restaurant`
- **Headers:** `Authorization: Bearer <token>`
- **Form Data:**
  - `logo`: file
  - `banner`: file

### Upload Multiple Product Images
- **POST** `/api/upload/product/multiple`
- **Headers:** `Authorization: Bearer <token>`
- **Form Data:**
  - `images`: files (multiple)

### Upload Single Product Image
- **POST** `/api/upload/product`
- **Headers:** `Authorization: Bearer <token>`
- **Form Data:**
  - `product_image`: file

### Upload Category Image
- **POST** `/api/upload/category`
- **Headers:** `Authorization: Bearer <token>`
- **Form Data:**
  - `category_image`: file

### Upload Driver Image
- **POST** `/api/upload/driver`
- **Headers:** `Authorization: Bearer <token>`
- **Form Data:**
  - `driver_image`: file

### Upload User Avatar
- **POST** `/api/upload/user/avatar`
- **Headers:** `Authorization: Bearer <token>`
- **Form Data:**
  - `avatar`: file

### Upload Offer Image
- **POST** `/api/upload/offer`
- **Headers:** `Authorization: Bearer <token>`
- **Form Data:**
  - `offer_image`: file

### Upload Splash Screen Image
- **POST** `/api/upload/splash`
- **Headers:** `Authorization: Bearer <token>`
- **Form Data:**
  - `splash_image`: file

### Upload Onboarding Screen Image
- **POST** `/api/upload/onboarding`
- **Headers:** `Authorization: Bearer <token>`
- **Form Data:**
  - `onboarding_image`: file

---

## Roles & Permissions

### Get Available Permissions
- **GET** `/api/roles/permissions`
- **Headers:** `Authorization: Bearer <token>`

### Get All Roles
- **GET** `/api/roles`
- **Headers:** `Authorization: Bearer <token>`

### Get Role By ID
- **GET** `/api/roles/:id`
- **Headers:** `Authorization: Bearer <token>`

### Get Users By Role
- **GET** `/api/roles/:role/users`
- **Headers:** `Authorization: Bearer <token>`

---

## Splash Screens

### Get Active Splash Screens (Public)
- **GET** `/api/splash/active`

### Get All Splash Screens
- **GET** `/api/splash`
- **Headers:** `Authorization: Bearer <token>`

### Get Splash Screen By ID
- **GET** `/api/splash/:id`
- **Headers:** `Authorization: Bearer <token>`

### Create Splash Screen
- **POST** `/api/splash`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "image": "image-url",
  "duration": 3000,
  "sortOrder": 0,
  "isActive": true
}
```

### Update Splash Screen
- **PUT** `/api/splash/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Same as create

### Toggle Splash Screen
- **PATCH** `/api/splash/:id/toggle`
- **Headers:** `Authorization: Bearer <token>`

### Delete Splash Screen
- **DELETE** `/api/splash/:id`
- **Headers:** `Authorization: Bearer <token>`

---

## Onboarding Screens

### Get Active Onboarding Screens (Public)
- **GET** `/api/onboarding/active`

### Get All Onboarding Screens
- **GET** `/api/onboarding`
- **Headers:** `Authorization: Bearer <token>`

### Get Onboarding Screen By ID
- **GET** `/api/onboarding/:id`
- **Headers:** `Authorization: Bearer <token>`

### Create Onboarding Screen
- **POST** `/api/onboarding`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "title": "Title",
  "titleAr": "العنوان",
  "description": "Description",
  "descriptionAr": "الوصف",
  "image": "image-url",
  "sortOrder": 0,
  "isActive": true
}
```

### Update Onboarding Screen
- **PUT** `/api/onboarding/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Same as create

### Toggle Onboarding Screen
- **PATCH** `/api/onboarding/:id/toggle`
- **Headers:** `Authorization: Bearer <token>`

### Delete Onboarding Screen
- **DELETE** `/api/onboarding/:id`
- **Headers:** `Authorization: Bearer <token>`

---

## Dashboard

### Get Dashboard KPIs
- **GET** `/api/dashboard/kpis`
- **Headers:** `Authorization: Bearer <token>`

### Get Revenue Chart
- **GET** `/api/dashboard/revenue-chart`
- **Headers:** `Authorization: Bearer <token>`
- **Query:** `?period=today|week|month|year`

### Get Orders Analytics
- **GET** `/api/dashboard/orders-analytics`
- **Headers:** `Authorization: Bearer <token>`

### Get Best Restaurants
- **GET** `/api/dashboard/best-restaurants`
- **Headers:** `Authorization: Bearer <token>`

### Get Best Products
- **GET** `/api/dashboard/best-products`
- **Headers:** `Authorization: Bearer <token>`

### Get Driver Performance
- **GET** `/api/dashboard/driver-performance`
- **Headers:** `Authorization: Bearer <token>`

### Get Recent Activities
- **GET** `/api/dashboard/recent-activities`
- **Headers:** `Authorization: Bearer <token>`

### Get Active Orders
- **GET** `/api/dashboard/active-orders`
- **Headers:** `Authorization: Bearer <token>`

---

## Notifications

### Get My Notifications
- **GET** `/api/notifications`
- **Headers:** `Authorization: Bearer <token>`

### Mark All as Read
- **PUT** `/api/notifications/mark-all-read`
- **Headers:** `Authorization: Bearer <token>`

### Mark as Read
- **PUT** `/api/notifications/:id/read`
- **Headers:** `Authorization: Bearer <token>`

### Delete Notification
- **DELETE** `/api/notifications/:id`
- **Headers:** `Authorization: Bearer <token>`

---

## Chat

### Get Chat Messages
- **GET** `/api/chat/messages?order_id=xxx`
- **GET** `/api/chat/messages?courier_order_id=xxx`
- **Headers:** `Authorization: Bearer <token>`

### Mark Messages as Read
- **POST** `/api/chat/messages/read`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "order_id": "order-id",
  "courier_order_id": "courier-order-id"
}
```

### Get Unread Count
- **GET** `/api/chat/messages/unread-count`
- **Headers:** `Authorization: Bearer <token>`

---

## Courier Orders

### Calculate Cost (Public)
- **GET** `/api/courier/calculate-cost`
- **Query:** `?pickup_latitude=25.1234&pickup_longitude=45.6789&delivery_latitude=25.2345&delivery_longitude=45.7890&weight=1.5`

### Get Payment Methods (Public)
- **GET** `/api/courier/payment-methods`

### Create Courier Order
- **POST** `/api/courier/orders`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "user_id": "user-id",
  "pickup_address_id": "address-id",
  "delivery_address_id": "address-id",
  "description": "Package description",
  "images": "[\"url1\", \"url2\"]",
  "weight": 1.5,
  "payment_method": "CASH",
  "coupon_code": "SAVE20",
  "notes": "Special instructions"
}
```

### Get All Courier Orders
- **GET** `/api/courier/orders`
- **Headers:** `Authorization: Bearer <token>`
- **Query:** `?status=PENDING&user_id=xxx&driver_id=xxx&page=1&limit=20`

### Get Courier Order By ID
- **GET** `/api/courier/orders/:id`
- **Headers:** `Authorization: Bearer <token>`

### Update Courier Order Status
- **PATCH** `/api/courier/orders/:id/status`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "status": "DELIVERED"
}
```

### Assign Driver
- **PATCH** `/api/courier/orders/:id/assign-driver`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "driver_id": "driver-id"
}
```

### Get Courier Order Tracking
- **GET** `/api/courier/orders/:id/tracking`
- **Headers:** `Authorization: Bearer <token>`

---

## Notes

1. **Authentication:** معظم الـ endpoints تحتاج إلى `Authorization: Bearer <token>` في الـ headers
2. **Base URL:** `http://localhost:5000/api`
3. **Content-Type:** `application/json` للـ JSON requests
4. **File Upload:** استخدم `multipart/form-data` لرفع الملفات
5. **Query Parameters:** يمكن استخدام query parameters للفلترة والبحث
6. **Pagination:** معظم الـ GET endpoints تدعم `page` و `limit` في query parameters

---

## Socket.IO Events

### Client → Server:
- `authenticate` - مصادقة المستخدم
- `join-order` - الانضمام لطلب طعام
- `join-courier-order` - الانضمام لطلب مندوب
- `send-message` - إرسال رسالة
- `mark-messages-read` - تحديد الرسائل كمقروءة
- `typing` - مؤشر الكتابة
- `driver-location-update` - تحديث موقع المندوب
- `order-status-update` - تحديث حالة الطلب

### Server → Client:
- `authenticated` - تأكيد المصادقة
- `message-sent` - تأكيد إرسال الرسالة
- `new-message` - رسالة جديدة
- `message-error` - خطأ في الإرسال
- `user-typing` - مؤشر الكتابة
- `messages-read` - تأكيد تحديد كمقروءة
- `driver-location` - موقع المندوب
- `order-status` - حالة الطلب

