# IvaPro PC Configurator

A modern web application for configuring and purchasing custom PCs, built with Next.js, Prisma, and React.

## Features

- 🖥️ Custom PC configuration interface
- 🏪 Ready-made PC catalog
- 🛒 Shopping cart functionality
- 👤 User authentication and authorization
- 🌐 Multi-language support (English, Latvian, Russian)
- 🎨 Responsive design with dark mode
- 👨‍💼 Admin and specialist dashboards
- 🔄 Configuration approval workflow

## Technologies

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MySQL
- **Authentication**: JWT with HTTP-only cookies
- **i18n**: next-intl for internationalization
- **Hosting**: Vercel (recommended)

## Project Structure

```
IvaPro-PC-Configurator/
├── app/                  # Main Next.js application
│   ├── [locale]/         # Localized routes
│   │   ├── (auth)/       # Authentication routes (login, register)
│   │   ├── (shop)/       # Shop routes (configurator, ready configs)
│   │   └── ...           # Other localized routes
│   ├── api/              # API endpoints
│   │   ├── auth/         # Authentication APIs
│   │   ├── admin/        # Admin APIs
│   │   └── ...           # Other API endpoints
│   ├── components/       # Reusable components
│   │   ├── Admin/        # Admin components
│   │   ├── Cart/         # Cart components
│   │   ├── Configurator/ # Configurator components
│   │   ├── Header/       # Header components
│   │   ├── ui/           # UI components
│   │   └── ...           # Other components
│   └── contexts/         # React contexts
├── lib/                  # Utility libraries
│   ├── prismaService.ts  # Prisma client service
│   ├── jwt.ts            # JWT utilities
│   └── apiErrors.ts      # API error handling
├── prisma/               # Prisma schema and migrations
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── messages/             # i18n translation files
│   ├── en.json           # English translations
│   ├── lv.json           # Latvian translations
│   └── ru.json           # Russian translations
└── public/               # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MySQL database

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ivapro-pc-configurator.git
cd ivapro-pc-configurator
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:

Create a `.env` file in the project root with the following variables:

```
# Database
DATABASE_URL="mysql://username:password@localhost:3306/ivapro"

# Auth
JWT_SECRET="your-secret-key"

# App configuration
NEXT_PUBLIC_DEFAULT_LOCALE="en"
NEXT_PUBLIC_DEFAULT_TIMEZONE="Europe/Riga"
```

4. Set up the database:

```bash
# Create database schema
npx prisma migrate dev

# Seed the database with initial data (optional)
npx prisma db seed
```

5. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Management

To open Prisma Studio (database visualization tool):

```bash
npx prisma studio
```

Prisma Studio will start at [http://localhost:5555](http://localhost:5555).

## Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
# or
bun build
```

## Deployment

The application is optimized for deployment on Vercel. Simply connect your GitHub repository to Vercel for automatic deployments.

### Environment Variables for Production

Make sure to set the following environment variables in your production environment:

- `DATABASE_URL`: Connection string to your MySQL database
- `JWT_SECRET`: Secret key for JWT token generation
- `NODE_ENV`: Set to "production"

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Prisma](https://prisma.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [next-intl](https://next-intl-docs.vercel.app/)
- [Lucide Icons](https://lucide.dev/)
- [Jose JWT](https://github.com/panva/jose)