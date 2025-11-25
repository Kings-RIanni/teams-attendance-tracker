# Microsoft Teams Attendance Tracker

A full-stack application for tracking student attendance in Microsoft Teams meetings with automated data collection and comprehensive reporting.

## Features

- Import attendance data from CSV files (provided by IT department)
- Track student attendance with join/leave times
- Student management system
- Comprehensive reporting and analytics
- Export attendance data to CSV
- Dashboard with visualizations
- Automated duplicate detection

## Tech Stack

### Frontend
- React 18 with TypeScript
- Material-UI (MUI) v7
- Axios for API requests
- Recharts for data visualization

### Backend
- Node.js with Express
- TypeScript
- CSV parsing with csv-parse
- Multer for file uploads
- PostgreSQL database

### Database
- PostgreSQL 14+
- Migrations with raw SQL

## Project Structure

```
attendance-tracker/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API and auth services
│   │   ├── hooks/        # Custom React hooks
│   │   └── types/        # TypeScript type definitions
│   └── package.json
│
├── backend/              # Node.js backend API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── models/       # Database models
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   ├── config/       # Configuration files
│   │   └── server.ts     # Application entry point
│   └── package.json
│
├── database/             # Database migrations and seeds
│   └── migrations/
│
└── docs/                 # Additional documentation
```

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- CSV files from your IT department containing Teams attendance data

## Implementation Options

This application supports **Option 1: IT-Managed CSV Import**

### Option 1: IT-Managed CSV Import (Current Setup)

In this mode:
- Your IT department sets up an Azure runbook to export attendance data
- The runbook generates CSV files automatically (daily/weekly)
- You download the CSV files and import them into the app
- No Azure AD credentials needed on your end

**To set this up:**
1. Send the [IT Request Document](./docs/IT_REQUEST_SIMPLE.md) to your IT department
2. IT department follows the [detailed runbook guide](./docs/OPTION1_IT_RUNBOOK.md)
3. Once set up, you'll receive CSV files via SharePoint or email
4. Import CSV files using the app's import feature

**Advantages:**
- No Azure AD access required for you
- IT maintains full control over credentials
- Secure and compliant with school policies
- Automated data extraction on IT's schedule

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/teams-attendance-tracker.git
cd teams-attendance-tracker
```

### 2. Set up the database

```bash
# Create PostgreSQL database
createdb attendance_tracker

# Run migrations
cd database
psql attendance_tracker < migrations/001_create_students.sql
psql attendance_tracker < migrations/002_create_meetings.sql
psql attendance_tracker < migrations/003_create_attendance.sql
```

### 3. Configure environment variables

#### Backend (.env)

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/attendance_tracker
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

#### Frontend (.env)

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

### 4. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## Development

### Start the backend server

```bash
cd backend
npm run dev
```

The API will be available at `http://localhost:3001`

### Start the frontend application

```bash
cd frontend
npm start
```

The application will open at `http://localhost:3000`

## Available Scripts

### Backend

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Lint code

### Frontend

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Lint code

## API Documentation

See [docs/API.md](docs/API.md) for detailed API documentation.

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for deployment instructions.

## Development Roadmap

- [x] Phase 1: Foundation and authentication ✅
- [x] Phase 2: Backend API implementation ✅
- [ ] Phase 3: Frontend dashboard (In Progress)
- [ ] Phase 4: Testing and refinement
- [ ] Phase 5: Documentation and deployment

## Current Status

**Backend**: ✅ Complete
- REST API with TypeScript and Express
- CSV import service with duplicate detection
- PostgreSQL database with migrations
- Full CRUD operations for Students, Meetings, Attendance
- CSV export and import functionality
- File upload with Multer
- Comprehensive error handling

**Frontend**: ✅ Complete
- React 18 with TypeScript
- Material-UI v7 components
- Dashboard with charts and statistics
- Student management (CRUD operations)
- Meeting list and reports
- CSV import interface
- CSV export with filtering

**Database**: ✅ Complete
- Migration scripts ready
- Optimized indexes
- Referential integrity configured

## Usage

1. **Request CSV from IT**: Contact your IT department and request attendance CSV files
2. **Import CSV**: Go to the "Sync" page and upload the CSV file
3. **View Dashboard**: See attendance statistics and charts
4. **Manage Students**: Add, edit, or remove students
5. **View Reports**: Filter and export attendance reports
6. **Export Data**: Download filtered attendance data as CSV

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.
