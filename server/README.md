# 🍔 Food Delivery Admin Dashboard - Backend

Backend API for the Food Delivery Admin Dashboard built with Node.js, Express, and Prisma ORM.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
# Copy the example file
cp ENV_EXAMPLE.txt .env

# Edit .env with your configuration
```

3. **Setup database:**
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE food_delivery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

4. **Run Prisma migrations:**
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. **Seed the database:**
```bash
npm run prisma:seed
```

6. **Start the server:**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 Project Structure

```
server/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.js            # Database seeding
│   └── migrations/        # Migration history
├── src/
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── utils/             # Utility functions
│       └── prisma.js      # Prisma client instance
├── index.js               # Entry point
├── package.json
└── README.md
```

## 🗄️ Database

This project uses **Prisma ORM** with **MySQL**.

### Key Models:
- **User** - Users and admins
- **Restaurant** - Restaurant details
- **Product** - Menu items
- **Order** - Customer orders
- **Driver** - Delivery drivers
- **Category** - Food categories
- **Coupon** - Discount coupons
- **Review** - User reviews
- **Tracking** - Order tracking

For detailed schema information, see `prisma/schema.prisma`

### Useful Commands:

```bash
# Generate Prisma Client
npm run prisma:generate

# Create and run migration
npm run prisma:migrate

# Open Prisma Studio (Database GUI)
npm run prisma:studio

# Seed database
npm run prisma:seed

# Reset database (⚠️ deletes all data)
npm run prisma:reset
```

For more details, check [PRISMA_SETUP.md](./PRISMA_SETUP.md)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

**Default Admin Credentials (after seeding):**
- Email: `admin@fooddelivery.com`
- Password: `admin123`

### Authentication Methods:
- Email/Password
- Phone OTP
- Google OAuth
- Apple Sign In

## 🛣️ API Routes

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/apple` - Apple Sign In
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Restaurants
- `GET /api/restaurants` - List restaurants
- `GET /api/restaurants/:id` - Get restaurant
- `POST /api/restaurants` - Create restaurant
- `PUT /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/status` - Update order status
- `PATCH /api/orders/:id/assign-driver` - Assign driver

### Drivers
- `GET /api/drivers` - List drivers
- `GET /api/drivers/:id` - Get driver
- `POST /api/drivers` - Create driver
- `PUT /api/drivers/:id` - Update driver

### Categories & More
- Categories: `/api/categories`
- Subcategories: `/api/subcategories`
- Offers: `/api/offers`
- Coupons: `/api/coupons`
- Reviews: `/api/reviews`
- Dashboard: `/api/dashboard`
- Notifications: `/api/notifications`

For complete API documentation, see [FOOD_DELIVERY_DASHBOARD_SPEC.md](../FOOD_DELIVERY_DASHBOARD_SPEC.md)

## 🔧 Environment Variables

Key environment variables (see `ENV_EXAMPLE.txt`):

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL="mysql://user:password@localhost:3306/food_delivery"

# JWT
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret

# OAuth
GOOGLE_CLIENT_ID=...
APPLE_CLIENT_ID=...

# Services
TWILIO_ACCOUNT_SID=...
SENDGRID_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
STRIPE_SECRET_KEY=...
GOOGLE_MAPS_API_KEY=...
```

## 📦 Dependencies

**Main:**
- `express` - Web framework
- `@prisma/client` - Database ORM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `socket.io` - Real-time communication
- `cors` - CORS middleware
- `dotenv` - Environment variables

**Dev:**
- `prisma` - Prisma CLI
- `nodemon` - Development server

## 🧪 Development

```bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Format Prisma schema
npx prisma format

# Validate Prisma schema
npx prisma validate
```

## 🚀 Deployment

1. Set environment variables in production
2. Run migrations: `npx prisma migrate deploy`
3. Generate Prisma Client: `npx prisma generate`
4. Start server: `npm start`

## 📝 Scripts

```json
{
  "start": "node index.js",
  "dev": "nodemon index.js",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:studio": "prisma studio",
  "prisma:seed": "node prisma/seed.js",
  "prisma:reset": "prisma migrate reset"
}
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run migrations if schema changed
4. Test thoroughly
5. Submit pull request

## 📄 License

ISC

## 🆘 Support

For issues and questions:
1. Check [PRISMA_SETUP.md](./PRISMA_SETUP.md) for Prisma-related issues
2. See [FOOD_DELIVERY_DASHBOARD_SPEC.md](../FOOD_DELIVERY_DASHBOARD_SPEC.md) for full specifications
3. Create an issue in the repository

---

**Built with ❤️ using Node.js, Express, and Prisma**

