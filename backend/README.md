# Recipe App Backend

Node.js + Express + SQLite backend for the Recipe Storage Application.

## Quick Start

```bash
# Install dependencies
cd backend
npm install

# Initialize database with sample data
npm run migrate -- --seed

# Start server
npm start
```

The API will be available at `http://localhost:3000`

## Development

```bash
# Start with auto-reload
npm run dev
```

## API Endpoints

### Health Check
**GET** `/api/health` - Check if server is running

### Recipes
- **GET** `/api/recipes` - Get all recipes
  - Query params: `?search=query&category=Dinner`
- **GET** `/api/recipes/:id` - Get single recipe
- **POST** `/api/recipes` - Create new recipe
- **PUT** `/api/recipes/:id` - Update recipe
- **DELETE** `/api/recipes/:id` - Delete recipe

## Database

SQLite database located at `db/recipes.db`

To view/edit the database:
```bash
# Install DB Browser for SQLite (optional)
brew install --cask db-browser-for-sqlite

# Open database
open db/recipes.db
```

## Environment Variables

Copy `.env.example` to `.env` to customize:

```
PORT=3000
NODE_ENV=development
DATABASE_PATH=./db/recipes.db
```

## Project Structure

```
backend/
├── server.js           # Express server
├── db/
│   ├── connection.js   # SQLite connection
│   ├── schema.sql      # Database schema
│   ├── migrate.js      # Migration script
│   └── recipes.db      # SQLite database (created on first run)
├── models/
│   └── Recipe.js       # Recipe model (CRUD operations)
└── routes/
    └── recipes.js      # API routes
```

## Troubleshooting

### "Cannot connect to database"
Make sure you've run the migration: `npm run migrate`

### "Port 3000 already in use"
Change the PORT in `.env` file or kill the process using port 3000

### "Module not found"
Run `npm install` to install dependencies
