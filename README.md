# Microsoft Teams Attendance Tracker

A full-stack application for tracking student attendance in Microsoft Teams meetings with automated data collection and comprehensive reporting.

## Features

- Automated attendance data sync from Microsoft Teams
- Real-time attendance tracking with join/leave times
- Student management system
- Comprehensive reporting and analytics
- Export attendance data (CSV, Excel)
- Dashboard with visualizations
- Role-based access control

## Tech Stack

### Frontend
- React 18 with TypeScript
- Material-UI (MUI)
- React Query for data fetching
- MSAL React for authentication
- Recharts for data visualization

### Backend
- Node.js with Express
- TypeScript
- Microsoft Graph API integration
- MSAL Node for authentication
- PostgreSQL database
- node-cron for scheduled tasks

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
- Microsoft 365 account with admin access
- Azure AD application registration

## Azure AD Setup

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to Azure Active Directory > App registrations
3. Click "New registration"
4. Name: "Teams Attendance Tracker"
5. Supported account types: "Accounts in this organizational directory only"
6. Redirect URI: `http://localhost:3001/auth/callback`
7. Click "Register"

### Configure API Permissions

1. Go to "API permissions" in your app
2. Add the following Microsoft Graph permissions:
   - **Delegated permissions**:
     - `OnlineMeetings.Read`
     - `OnlineMeetings.ReadWrite`
     - `Calendars.Read`
     - `User.Read`
     - `User.ReadBasic.All`
   - **Application permissions**:
     - `OnlineMeetings.Read.All`
     - `CallRecords.Read.All`
     - `User.Read.All`
3. Click "Grant admin consent"

### Create Client Secret

1. Go to "Certificates & secrets"
2. Click "New client secret"
3. Add description and set expiration
4. Copy the secret value (you won't see it again!)

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

# Azure AD
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_TENANT_ID=your-tenant-id
REDIRECT_URI=http://localhost:3001/auth/callback

# JWT
JWT_SECRET=generate-a-secure-random-string
```

#### Frontend (.env)

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_AZURE_CLIENT_ID=your-client-id
REACT_APP_AZURE_TENANT_ID=your-tenant-id
REACT_APP_REDIRECT_URI=http://localhost:3000
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

- [x] Phase 1: Foundation and authentication
- [ ] Phase 2: Core attendance features
- [ ] Phase 3: Reporting and analytics
- [ ] Phase 4: Polish and deployment

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.
