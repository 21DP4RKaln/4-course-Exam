# Course 4 Exam Project

This project is developed as part of the Course 3 exam, utilizing Next.js and Prisma technologies.

## Technologies

- [Next.js](https://nextjs.org/) - React framework with server-side rendering capabilities
- [Prisma](https://www.prisma.io/) - ORM for database management
- [React](https://reactjs.org/) - User interface library

## Project Structure

```
Exam-3-
├── app/            # Main Next.js application code
├── hooks/          # React hooks
├── lib/            # Utility functions and common libraries
├── messages/       # Internationalization files
├── nonused/        # Unused components/code
└── prisma/         # Prisma database configuration and schemas
```

## Installation

1. Make sure Node.js and npm are installed on your computer. If not, download and install from [nodejs.org](https://nodejs.org/)

```bash
# Verify Node.js installation
node -v

# Verify npm installation
npm -v

# If npm needs to be installed or updated
npm install -g npm
```

2. Clone the repository:

```bash
git clone <repository_url>
cd Exam-4-course
```

3. Install dependencies:

```bash
npm install #before that in your pc ensure Node.js is installed
# or
yarn install
# or
pnpm install
# or
bun install
```

4. Set up the database:

```bash
# Import existing database schema
npx prisma db pull

# Or distribute changes to the database
npx prisma db push
```

5. Configure environment variables:

Create a `.env` file in the project root directory and add necessary configuration variables:

```
DATABASE_URL="your_database_url"
```

## Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Database Management

To open Prisma Studio (database visualization tool):

```bash
npx prisma studio
```

Prisma Studio will start and automatically open in your default web browser (typically at http://localhost:5555)

## Testing

```bash
npm run test
# or
yarn test
```

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

## Useful Resources

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Prisma Documentation](https://www.prisma.io/docs/) - explore Prisma functionality.
- [Node.js Documentation](https://nodejs.org/en/docs/) - learn about Node.js.
