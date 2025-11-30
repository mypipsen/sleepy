# Sleepy

AI-powered story generation app for kids with customizable instructions and persistent user sessions.

## Tech Stack

- **Framework**: Next.js (App Router, Turbopack)
- **Auth**: NextAuth.js (credentials provider)
- **Database**: PostgreSQL + Drizzle ORM
- **API**: tRPC
- **AI**: OpenAI (via AI SDK)
- **Styling**: Tailwind CSS

## Setup

```bash
# Install dependencies
npm install

# Start local PostgreSQL
docker-compose up -d

# Push schema to database
npm run db:push

# Seed database (optional)
npm run db:seed

# Start dev server
npm run dev
```

Configure `.env` with your OpenAI API key and database URL (see `.env.example`).

## Key Features

- User authentication with username/password
- AI story generation with custom user instructions
- Story history per user
- Kid-friendly pastel UI design

## Scripts

- `npm run dev` - Start dev server with Turbopack
- `npm run build` - Production build
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:seed` - Seed database with test data
- `npm run db:reset` - Reset database
- `npm run check` - Lint + typecheck
