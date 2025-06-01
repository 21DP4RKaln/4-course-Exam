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

- `/app` - Main application code (Next.js App Router)
- `/lib` - Utility functions, services, and shared code
- `/prisma` - Database schema and migrations
- `/public` - Static assets
- `/scripts` - Utility scripts for development and maintenance

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- MySQL database
- Stripe account (for payment processing)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
   ```
2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```
   
   **Note**: If you encounter build errors about missing modules (`@radix-ui/react-select`, `fs-extra`, `pdfkit`), install them separately:
   ```bash
   npm install @radix-ui/react-select fs-extra pdfkit --legacy-peer-deps
   ```
3. **Set up environment variables**
   - Create a `.env` file based on `.env.example` and fill in your database connection string and other configuration.
4. **Initialize the database**
   ```bash
   npx prisma migrate dev
   ```
5. **Seed the database with initial data**
   ```bash
   npm run seed
   ```
6. **Start the development server**
   ```bash
   npm run dev
   ```

### Build for Production
```bash
npm run build
npm run start
```

### Memory-Optimized Development

Ja rodas atmiņas problēmas izstrādes laikā, izmanto šīs komandas:

```bash
npm run dev:high-memory      # 8GB RAM
npm run dev:simple           # 4GB RAM
npm run dev:clean            # Pēc kešu iztīrīšanas
npm run dev:reduced          # Samazināts maršrutu skaits
```

### Memory-Optimized Build

```bash
npm run build:high-memory    # 8GB RAM
npm run build:low-memory     # 4GB RAM, viens pavediens
npm run build:clean          # Pēc kešu iztīrīšanas
```

## Default Accounts

- Admin: admin@ivapro.com / admin123
- Specialist: specialist@ivapro.com / admin123
- User: user@ivapro.com / admin123

## Development Scripts

- `npm run dev` - Start development server
- `npm run dev:high-memory` - Start dev server with increased memory allocation
- `npm run build` - Build for production
- `npm run build:clean` - Clean and build for production
- `npm run prisma:studio` - Open Prisma Studio to view/edit database
- `npm run seed` - Seed the database with initial data

## Notes for Developers

- The project uses Next.js App Router with route groups and internationalized routing
- Ensure you run `prisma:generate` after schema changes
- Use the appropriate locale prefix for all internal links
- Shared UI components are in `app/components/ui/`

## API Routes

- `app/api/admin/` - Admin API routes
- `app/api/auth/` - Authentication API routes
- `app/api/components/route.ts` - Component data API
- `app/api/dashboard/` - Dashboard data API
- `app/api/shop/product/[id]/route.ts` - Shop product data API

## Lib Directory

- `lib/apiErrors.ts` - API error handling utilities
- `lib/jwt.ts` - JWT authentication functions
- `lib/messages/` - Internationalization message files
- `lib/prismaService.ts` - Prisma client setup
- `lib/seeder.ts` - Database seeding script
- `lib/utils.ts` - General utility functions
- `lib/services/` - Business logic services

## Database (Prisma)

- `prisma/schema.prisma` - Database schema
- `prisma/migrations/` - Database migrations

## Public Directory

- `public/uploads/profiles/` - User profile images
- `public/*.svg` - Static SVG assets

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

## Technologies Used

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MySQL
- **Authentication**: JWT, next-auth
- **Internationalization**: next-intl
- **Payment Processing**: Stripe
- **Validation**: Zod, React Hook Form