# 🍔 Food Delivery Admin Dashboard

A comprehensive full-stack admin dashboard for managing a food delivery platform with real-time order tracking, restaurant management, and driver coordination.

## 🎯 Overview

This project provides a complete solution for managing a food delivery business, including:

- **User Management** - Customers, admins, restaurant managers, drivers
- **Restaurant Management** - Multi-branch support, menus, offers
- **Product Management** - Categories, items, extras, pricing
- **Order Management** - Real-time tracking, status updates
- **Driver Management** - Live location, assignments, performance
- **Reviews & Ratings** - Product and restaurant reviews
- **Coupons & Offers** - Promotional campaigns
- **Analytics Dashboard** - Revenue, orders, performance metrics

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - API calls
- **Socket.io Client** - Real-time updates

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Prisma ORM** - Database management
- **MySQL** - Database
- **JWT** - Authentication
- **Socket.io** - Real-time communication
- **bcrypt** - Password hashing

### Authentication
- Email/Password with JWT
- Phone OTP verification
- Google OAuth 2.0
- Apple Sign In

## 📁 Project Structure

```
tak/
├── client/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── contexts/         # React contexts
│   │   ├── services/         # API services
│   │   └── layouts/          # Layout components
│   └── package.json
│
├── server/                    # Backend (Node.js + Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.js           # Database seeding
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Express middleware
│   │   └── utils/            # Utility functions
│   └── package.json
│
└── FOOD_DELIVERY_DASHBOARD_SPEC.md  # Complete specifications
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tak
```

### 2. Setup Backend

```bash
cd server

# Install dependencies
npm install

# Configure environment (copy and edit .env)
cp ENV_EXAMPLE.txt .env
# Edit .env with your database credentials and API keys

# Create MySQL database
mysql -u root -p
CREATE DATABASE food_delivery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Run Prisma migrations
npm run prisma:generate
npm run prisma:migrate

# Seed database with initial data
npm run prisma:seed

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

**Default Admin Login:**
- Email: `admin@fooddelivery.com`
- Password: `admin123`

### 3. Setup Frontend

```bash
cd ../client

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📚 Documentation

- **[Complete Specification](./FOOD_DELIVERY_DASHBOARD_SPEC.md)** - Full project specifications with 37 screens, API endpoints, and database schema
- **[Prisma Setup Guide](./server/PRISMA_SETUP.md)** - Detailed Prisma ORM setup and usage
- **[Backend README](./server/README.md)** - Backend-specific documentation
- **[Frontend README](./client/README.md)** - Frontend-specific documentation

## 🗄️ Database

The project uses **Prisma ORM** with **MySQL**.

### Key Models (20+ total):
- User, Restaurant, Product, Order
- Driver, Category, Coupon, Review
- Tracking, Notification, Setting, etc.

### Prisma Commands:

```bash
cd server

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio (GUI)
npm run prisma:studio

# Seed database
npm run prisma:seed

# Reset database (⚠️ deletes data)
npm run prisma:reset
```

## 🔐 Authentication

Multiple authentication methods supported:

1. **Email/Password** - Traditional login with JWT
2. **Phone OTP** - SMS verification (Twilio)
3. **Google OAuth** - Sign in with Google
4. **Apple Sign In** - Sign in with Apple

### User Roles:
- **SUPER_ADMIN** - Full system access
- **RESTAURANT_MANAGER** - Manage own restaurant
- **SUPPORT_AGENT** - Handle orders and support
- **ANALYST** - View analytics only
- **CUSTOMER** - Place orders
- **DRIVER** - Deliver orders

## 🌟 Key Features

### Dashboard
- Real-time KPIs (revenue, orders, users, drivers)
- Revenue and orders charts
- Top restaurants and products
- Recent orders feed
- Live notifications

### Restaurant Management
- Create and manage restaurants
- Multiple branches support
- Menu sections and categories
- Operating hours configuration
- Delivery settings and radius
- Commission rates

### Product Management
- Products with multiple images
- Categories and subcategories
- Product extras (add-ons)
- Ingredients list
- Price and discounts
- Availability toggle

### Order Management
- Real-time order updates
- Status tracking (Pending → Delivered)
- Driver assignment
- Order cancellation
- Invoice generation
- Order history and analytics

### Live Tracking
- Google Maps integration
- Real-time driver location
- Customer and restaurant markers
- Route visualization
- ETA calculation
- Auto-refresh updates

### Driver Management
- Driver profiles and verification
- Vehicle details and documents
- Live location tracking
- Performance metrics
- Earnings summary
- Delivery history

### Reviews & Ratings
- Product reviews
- Restaurant reviews
- Rating system (1-5 stars)
- Review moderation
- Restaurant responses

### Coupons & Offers
- Percentage and fixed discounts
- Usage limits
- User restrictions
- Validity periods
- Usage tracking
- Auto-generate codes

## 🔌 API Endpoints

The backend provides 100+ RESTful API endpoints:

### Main Routes:
- `/api/auth/*` - Authentication
- `/api/users/*` - User management
- `/api/restaurants/*` - Restaurant CRUD
- `/api/products/*` - Product management
- `/api/orders/*` - Order operations
- `/api/drivers/*` - Driver management
- `/api/categories/*` - Categories
- `/api/coupons/*` - Coupon management
- `/api/reviews/*` - Review system
- `/api/dashboard/*` - Analytics
- `/api/tracking/*` - Order tracking
- `/api/notifications/*` - Notifications

See [API Documentation](./FOOD_DELIVERY_DASHBOARD_SPEC.md#-section-4--api-routes) for complete list.

## 🎨 UI Components

50+ reusable React components:

- **Layout**: Sidebar, Navbar, Footer
- **Forms**: Input, Select, Textarea, DatePicker
- **Data**: DataTable, Pagination, SearchBar, Filter
- **Dashboard**: KPI Cards, Charts (Line, Bar, Pie)
- **Common**: Button, Modal, Alert, Badge, Tooltip
- **Maps**: Google Maps integration

## 🌐 Real-Time Features

Using Socket.io:
- Live order updates
- Real-time driver location
- Order status notifications
- New order alerts
- Driver availability status

## 📊 Analytics

- Revenue tracking (daily, weekly, monthly)
- Order statistics and trends
- Restaurant performance
- Product popularity
- Driver metrics
- Customer insights

## 🔒 Security

- Password hashing with bcrypt (10+ salt rounds)
- JWT token authentication
- Refresh token mechanism
- Role-based access control (RBAC)
- Input validation and sanitization
- SQL injection prevention (Prisma)
- XSS protection
- CORS configuration
- Rate limiting

## 🚀 Deployment

### Backend Deployment

```bash
# Set production environment
NODE_ENV=production
DATABASE_URL=mysql://...

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Start server
npm start
```

### Frontend Deployment

```bash
# Build for production
npm run build

# Deploy 'dist' folder to:
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
```

## 📈 Development Roadmap

See [Development Roadmap](./FOOD_DELIVERY_DASHBOARD_SPEC.md#-section-7--development-roadmap) for 15-phase implementation plan (12 weeks).

## 🧪 Testing

```bash
# Backend
cd server
npm test

# Frontend
cd client
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL=mysql://user:pass@localhost:3306/food_delivery
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=...
TWILIO_ACCOUNT_SID=...
STRIPE_SECRET_KEY=...
GOOGLE_MAPS_API_KEY=...
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=...
```

See `ENV_EXAMPLE.txt` files in each directory.

## 🆘 Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists
- Check user permissions

### Prisma Issues
```bash
# Regenerate client
npm run prisma:generate

# Reset database
npm run prisma:reset

# Check migrations
npx prisma migrate status
```

### Port Already in Use
```bash
# Backend (default: 5000)
PORT=5001 npm run dev

# Frontend (default: 5173)
# Edit vite.config.js
```

## 📄 License

ISC

## 👥 Support

For support:
1. Check documentation files
2. Review [specifications](./FOOD_DELIVERY_DASHBOARD_SPEC.md)
3. Open an issue on GitHub

---

**Built with ❤️ using React, Node.js, Express, Prisma, and MySQL**

**Version:** 1.0.0
**Last Updated:** January 13, 2026
#   k e t  
 