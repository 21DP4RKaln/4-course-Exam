# IvaPro PC Configurator

A full-stack web application for creating custom PC configurations, managing ready-made PCs, and handling orders.

## Project Structure

### Root Files
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

### Core Directories
- `/app` - Main application code (Next.js App Router)
- `/lib` - Utility functions, services, and shared code
- `/prisma` - Database schema and migrations
- `/public` - Static assets

### App Structure

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
- `app/[locale]/shop/ready-made/page.tsx` - Pre-configured PCs
- `app/[locale]/shop/product/[id]/page.tsx` - Product details

**Cart & Checkout:**
- `app/[locale]/cart/page.tsx` - Shopping cart
- `app/[locale]/checkout/page.tsx` - Checkout process
- `app/[locale]/orders/[id]/page.tsx` - Order details

**Admin Panel:**
- `app/[locale]/admin/page.tsx` - Admin dashboard
- `app/[locale]/admin/components/create/page.tsx` - Create components
- `app/[locale]/admin/components/edit/[id]/page.tsx` - Edit components
- `app/[locale]/admin/components/view/[id]/page.tsx` - View components
- `app/[locale]/admin/configurations/create/page.tsx` - Create configurations
- `app/[locale]/admin/configurations/edit/[id]/page.tsx` - Edit configurations
- `app/[locale]/admin/configurations/view/[id]/page.tsx` - View configurations
- `app/[locale]/admin/orders/edit/[id]/page.tsx` - Edit orders
- `app/[locale]/admin/orders/view/[id]/page.tsx` - View orders
- `app/[locale]/admin/users/edit/[id]/page.tsx` - Edit users
- `app/[locale]/admin/users/view/[id]/page.tsx` - View users

**Specialist Panel:**
- `app/[locale]/specialist/page.tsx` - Specialist dashboard

#### Component Structure
- `app/components/Configurator/` - Configurator components
  - `ComponentSelectionPanel.tsx`
  - `SelectedComponents.tsx`
  - `ConfigurationSummary.tsx`

- `app/components/Dashboard/` - Dashboard components
  - `ProfileTab.tsx` - User profile management

- `app/components/Footer/` - Footer components
  - `Footer.tsx`

- `app/components/Header/` - Header components
  - `Header.tsx`
  - `LanguageSwitcher.tsx`
  - `MobileMenu.tsx`

- `app/components/Home/` - Home page components
  - `HeroSection.tsx`
  - `FeaturedConfigurations.tsx`
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

## Deployment

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