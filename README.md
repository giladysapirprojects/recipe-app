# Recipe Storage Application

A modern recipe management app with a beautiful web interface and local SQLite database.

## Architecture

- **Frontend**: Vanilla HTML/CSS/JavaScript (ES6 modules)
- **Backend**: Node.js + Express + SQLite
- **Database**: SQLite with normalized schema

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser

### Installation

1. **Start the Backend**:
```bash
cd backend
npm install
npm run migrate -- --seed
npm start
```

Backend will run on `http://localhost:3000`

2. **Open the Frontend**:
```bash
cd frontend
# Open index.html in browser, or use a local server:
python3 -m http.server 8000
```

Then visit `http://localhost:8000`

## Features

✅ Create, read, update, delete recipes  
✅ Search across titles, ingredients, and tags  
✅ Filter by category (Breakfast, Lunch, Dinner, etc.)  
✅ Dynamic ingredient and instruction fields  
✅ Persistent storage in SQLite database  
✅ Premium modern UI with smooth animations  
✅ Responsive design (mobile, tablet, desktop)  

## Project Structure

```
recipe-app/
├── frontend/           # Web application
│   ├── index.html
│   ├── styles/
│   └── scripts/
├── backend/            # API server
│   ├── server.js
│   ├── db/
│   ├── models/
│   └── routes/
└── docs/               # Documentation
    └── walkthrough.md
```

## Documentation

- [Backend README](backend/README.md) - API documentation and setup
- [Walkthrough](docs/walkthrough.md) - Complete feature guide
- [Testing Guide](tests/README.md) - Automated testing with Selenium

## Testing

Automated tests using Selenium WebDriver validate all major features without requiring screen capture permissions.

**Run all tests** (headless mode):
```bash
cd tests
npm install
npm test
```

**Run tests with visible browser**:
```bash
npm run test:visible
```

See the [Testing README](tests/README.md) for detailed instructions.


## Development

**Backend** (with auto-reload):
```bash
cd backend
npm run dev
```

**Database Migration**:
```bash
cd backend
npm run migrate
```

## Future Enhancements

- Image uploads for recipes
- User authentication
- Cloud deployment (PostgreSQL)
- Meal planning calendar
- Shopping list generation
- Recipe import from URLs

## License

MIT
