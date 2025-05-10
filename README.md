# IvaPro PC Configurator

A full-stack web application designed for creating custom PC configurations, managing pre-built computers, and processing orders.

## Project Features

- PC component customization and configuration
- Purchase of pre-built computers
- User authentication and profile management
- Admin panel for product and order management
- Specialist panel for repair and support management
- Multilingual support (Latvian, English, Russian)
- Dark and light mode
- Responsive design for all devices

## Project Structure

### Main Files
- `.gitignore` - Git ignore configuration
- `README.md` - This project documentation
- `next.config.mjs` - Next.js configuration
- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `postcss.config.js` - PostCSS configuration
- `eslint.config.mjs` - ESLint configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `middleware.ts` - Next.js middleware for routing
- `next-intl.config.ts` - Internationalization configuration
- `Dockerfile` - Docker container configuration
- `docker-compose.yml` - Docker composition settings

### Core Directories
- `/app` - Main application code (Next.js App Router)
- `/lib` - Utility functions, services, and shared code
- `/prisma` - Database schema and migrations
- `/public` - Static assets

### Application Structure

#### Core App Files
- `app/layout.tsx` - Root layout
- `app/page.tsx` - Root page (redirects to localized home)
- `app/globals.css` - Global CSS

#### Localization Setup
- `app/i18n/config.ts` - i18n configuration 
- `app/i18n/messages.ts` - Message loading utilities
- `app/i18n/providers.tsx` - i18n provider components

#### Context Providers
- `app/contexts/AuthContext.tsx` - Authentication context
- `app/contexts/CartContext.tsx` - Shopping cart context
- `app/contexts/ThemeContext.tsx` - Theme context (light/dark mode)
- `app/contexts/WishlistContext.tsx` - Wishlist context

#### Localized Pages and Routes
- `app/[locale]/layout.tsx` - Main layout with header and footer
- `app/[locale]/page.tsx` - Home page

**Authentication Pages:**
- `app/[locale]/auth/login/page.tsx` - Login page
- `app/[locale]/auth/register/page.tsx` - Registration page
- `app/[locale]/auth/forgot-password/page.tsx` - Password recovery

**User Dashboard:**
- `app/[locale]/dashboard/page.tsx` - User dashboard

**Configurator:**
- `app/[locale]/configurator/page.tsx` - PC configurator tool

**Shop:**
- `app/[locale]/shop/ready-made/page.tsx` - Pre-built PCs
- `app/[locale]/shop/product/[id]/page.tsx` - Product details

**Cart & Checkout:**
- `app/[locale]/cart/page.tsx` - Shopping cart
- `app/[locale]/checkout/page.tsx` - Checkout process
- `app/[locale]/orders/[id]/page.tsx` - Order details

**Admin Panel:**
- `app/[locale]/admin/page.tsx` - Admin dashboard
- `app/[locale]/admin/components/` - Component management
- `app/[locale]/admin/configurations/` - Configuration management
- `app/[locale]/admin/orders/` - Order management
- `app/[locale]/admin/users/` - User management

**Specialist Panel:**
- `app/[locale]/staff/page.tsx` - Specialist dashboard
- `app/[locale]/staff/repairs/` - Repair management

### API Routes
- `app/api/admin/` - Admin API routes
- `app/api/auth/` - Authentication API routes
- `app/api/checkout/` - Checkout API
- `app/api/components/` - Component data API
- `app/api/configurations/` - Configuration API
- `app/api/dashboard/` - Dashboard data API
- `app/api/orders/` - Orders API
- `app/api/profile/` - Profile API
- `app/api/repairs/` - Repairs API
- `app/api/reviews/` - Reviews API
- `app/api/shop/` - Shop product API
- `app/api/staff/` - Staff API
- `app/api/wishlist/` - Wishlist API

## Technical Specifications

- **Frontend:** Next.js 15.x (App Router), React 18
- **Backend:** Next.js API routes
- **Database:** MySQL 8.0 with Prisma ORM
- **Styling:** Tailwind CSS
- **Authentication:** JWT
- **Internationalization:** next-intl
- **Containers:** Docker

## Setup Instructions

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma migrate dev
```

3. Seed the database with initial data:
```bash
npm run seed
```

4. Run the development server:
```bash
npm run dev
```

### Docker Setup

1. Build and run containers:
```bash
docker-compose up -d
```

2. Access MySQL admin panel using phpMyAdmin:
```
http://localhost:8080
```

3. Access the application:
```
http://localhost:3000
```

### Database Seeding with Docker

Seed the database using Docker container:

```bash
# For Windows using PowerShell
.\run-seeder-debian-windows.ps1

# For Windows using CMD
run-seeder-debian-windows.bat

# For Linux/Unix systems
./run-seeder.sh
```

This will build and run a Docker container that uses TSX to execute the TypeScript seeder script (`lib/seeder.ts`) directly, populating the database with test data including:
- Default user accounts
- Component categories
- Specification keys
- Sample components
- Pre-built PC configurations

### Production Environment

Build the application for production:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Default Accounts

- Admin: admin@ivapro.com / admin123
- Specialist: specialist@ivapro.com / admin123
- User: user@ivapro.com / admin123

## Environment Variables

Create a `.env` file with the following variables:

```
# Database
DATABASE_URL="mysql://root:password@localhost:3306/ivapro"

# Authentication
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"

# Stripe (for payments)
STRIPE_SECRET_KEY="your-stripe-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-key"

# General settings
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## Recent Updates

- Added profile picture support
- Split name field into first name and last name
- Added phone number registration option
- Implemented profile management in dashboard
- Added the ability to update contact information
- Added dual authentication with either email or phone
- Added Docker support for easy deployment

## Licensing

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).