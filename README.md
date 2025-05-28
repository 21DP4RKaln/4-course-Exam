# PC E-Commerce & Configurator

A full-stack web application for browsing computer components, creating custom PC configurations, purchasing pre-built configurations, and managing orders.

## Features

- 🌐 **Multi-language Support**: Latvian, English, and Russian language options
- 🔄 **Light/Dark Mode**: Theme switching for better user experience
- 🛒 **Advanced Shopping System**: Filter, sort, and search products by various criteria
- 🔧 **PC Configurator**: Build custom PC configurations with compatible components
- 👤 **User Authentication**: Secure login/registration with JWT
- 📱 **Responsive Design**: Optimized for desktop and mobile devices
- 💳 **Payment Processing**: Secure checkout experience
- 📊 **User Dashboard**: Order tracking and account management
- 🔒 **Admin Panel**: Manage products, orders, and users

## Technology Stack

### Frontend
- **Framework**: Next.js 15.x (App Router)
- **UI**: React 19.x with Tailwind CSS
- **State Management**: React Context API
- **Internationalization**: next-intl
- **Icons**: Lucide React
- **Form Handling**: React Hook Form
- **Charts & Visualizations**: Recharts

### Backend
- **API**: Next.js API Routes
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Processing**: Stripe API
- **Email**: Nodemailer

## Project Structure

### Core Directories
- `/app` - Main application code (Next.js App Router)
- `/lib` - Utility functions, services, and shared code
- `/prisma` - Database schema and migrations
- `/public` - Static assets
- `/scripts` - Utility scripts for development and maintenance

### Key Components

#### Shop Components
- `AdvancedFilter.tsx` - Advanced filtering for shop products
- `ProductCard.tsx` - Product display card component
- `ProductDetail.tsx` - Detailed product view
- `SpecificationsTable.tsx` - Technical specifications display

#### Context Providers
- `app/contexts/AuthContext.tsx` - Authentication state management
- `app/contexts/CartContext.tsx` - Shopping cart state management
- `app/contexts/ThemeContext.tsx` - Theme (light/dark) state management
- `app/contexts/WishlistContext.tsx` - User wishlist state management
- `app/contexts/ConfiguratorCartContext.tsx` - PC configurator cart management

#### Localized Routes
- `app/[locale]/layout.tsx` - Main layout with header and footer
- `app/[locale]/(home)/page.tsx` - Home page
- `app/[locale]/configurator/` - PC configurator tool
- `app/[locale]/auth/` - Authentication pages (login, register)
- `app/[locale]/(staff)/` - Admin and staff panels

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- MySQL database
- Stripe account (for payment processing)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file based on `.env.example` with your database connection string and other configuration.

4. Initialize the database
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Seed the database with initial data
```bash
npm run seed
```

6. Start the development server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm run start
```

## Development Scripts

- `npm run dev` - Start development server
- `npm run dev:high-memory` - Start dev server with increased memory allocation
- `npm run build` - Build for production
- `npm run build:clean` - Clean and build for production
- `npm run prisma:studio` - Open Prisma Studio to view/edit database
- `npm run seed` - Seed the database with initial data

## Notes for Developers

- The project uses Next.js App Router with route groups and internationalized routing
- Ensure you run prisma:generate after schema changes
- Use the appropriate locale prefix for all internal links
  - `ServicesSection.tsx`

- `app/components/ui/` - Shared UI components
  - `tabs.tsx`

#### API Routes
- `app/api/admin/` - Admin API routes
  - `route.ts`
  - `components/[id]/route.ts`
  - `components/route.ts`
  - `configurations/[id]/route.ts`
  - `configurations/route.ts`
  - `orders/[id]/route.ts`
  - `orders/route.ts`
  - `users/[id]/route.ts`
  - `users/route.ts`

- `app/api/auth/` - Authentication API routes
  - `login/route.ts`
  - `logout/route.ts`
  - `me/route.ts`
  - `register/route.ts`
  - `update-profile/route.ts`

- `app/api/components/route.ts` - Component data API
- `app/api/dashboard/` - Dashboard data API
  - `configurations/[id]/route.ts`
  - `configurations/route.ts`
  - `orders/[id]/route.ts`
  - `orders/route.ts`
- `app/api/shop/product/[id]/route.ts` - Shop product data API

### Lib Directory
- `lib/apiErrors.ts` - API error handling utilities
- `lib/jwt.ts` - JWT authentication functions
- `lib/messages/` - Internationalization message files
  - `en.json` - English translations
  - `lv.json` - Latvian translations
  - `ru.json` - Russian translations
- `lib/prismaService.ts` - Prisma client setup
- `lib/seeder.ts` - Database seeding script
- `lib/utils.ts` - General utility functions
- `lib/utils/adminHelpers.tsx` - Admin panel utilities

**Service Files:**
- `lib/services/configuratorService.ts` - Configurator business logic
- `lib/services/dashboardService.ts` - Dashboard data functions
- `lib/services/shopService.ts` - Shop functionality
- `lib/services/specialistService.ts` - Specialist panel functions

### Database (Prisma)
- `prisma/schema.prisma` - Database schema
- `prisma/migrations/` - Database migrations

### Public Directory
- `public/uploads/profiles/` - User profile images
- `public/file.svg`, `public/globe.svg`, etc. - Static SVG assets

## Key Features

- User authentication with both email and phone support
- PC component configurator with compatibility checking
- Ready-made PC shop with product listings and details
- Role-based access (Admin, Specialist, User)
- Multi-language support (English, Latvian, Russian)
- Order management system
- User dashboard with profile management
- Admin panel for inventory and user management

## Recent Updates

- Added profile picture support
- Split name field into first name and last name
- Added phone number registration option
- Implemented profile management in dashboard
- Added the ability to update contact information
- Added dual authentication with either email or phone

## Setup Instructions

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

### Memory-Optimized Development

If you encounter memory issues during development, you can use these commands:

```bash
# Development with increased memory (8GB)
npm run dev:high-memory

# Development with optimized memory settings (4GB)
npm run dev:simple

# Development after cleaning caches
npm run dev:clean

# Development with reduced routes
npm run dev:reduced
```

## Deployment

Build the application for production:
```bash
npm run build
```

If you encounter memory issues during build, try one of these alternatives:

```bash
# High memory build (8GB)
npm run build:high-memory

# Low memory build (4GB, single thread)
npm run build:low-memory

# Clean build (removes caches first)
npm run build:clean
```

Start the production server:
```bash
npm start
```

## Default Accounts

- Admin: admin@ivapro.com / admin123
- Specialist: specialist@ivapro.com / admin123
- User: user@ivapro.com / admin123

## Technologies Used

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MySQL
- **Authentication**: JWT, next-auth
- **Internationalization**: next-intl
- **Payment Processing**: Stripe
- **Validation**: Zod, React Hook Form