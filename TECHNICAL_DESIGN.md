# Microsoft Teams Attendance Tracker - Technical Design Document

## Overview
An application to track student attendance in Microsoft Teams meetings, recording join times and generating attendance reports.

## Application Architecture

### Recommended Architecture: Three-Tier Web Application

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                    │
│  - Dashboard UI                                         │
│  - Attendance Reports                                   │
│  - Student Management                                   │
└─────────────────────────────────────────────────────────┘
                            ↓ HTTPS/REST API
┌─────────────────────────────────────────────────────────┐
│                  Backend API (Node.js)                  │
│  - Authentication (Microsoft OAuth 2.0)                 │
│  - Microsoft Graph API Integration                      │
│  - Business Logic                                       │
│  - Data Processing                                      │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              Database (PostgreSQL/MongoDB)              │
│  - Student Records                                      │
│  - Attendance Logs                                      │
│  - Meeting Metadata                                     │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React with TypeScript
- **UI Library**: Material-UI (MUI) or Tailwind CSS
- **State Management**: React Query + Context API
- **Charting**: Recharts or Chart.js
- **Authentication**: MSAL (Microsoft Authentication Library) for React

**Why React?**
- Rich ecosystem for data visualization
- Excellent Microsoft authentication libraries
- Strong TypeScript support
- Large community and resources

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js or NestJS
- **Language**: TypeScript
- **Authentication**: MSAL Node
- **API Client**: @microsoft/microsoft-graph-client
- **Validation**: Zod or Joi
- **Task Scheduling**: node-cron or Bull (for recurring data fetches)

**Why Node.js?**
- Excellent Microsoft Graph SDK support
- JavaScript/TypeScript across full stack
- Great async handling for API calls
- Fast development cycle

**Alternative Backend Options:**
- **Python (FastAPI)**: If you prefer Python, excellent for data processing
- **C# (.NET)**: Native Microsoft ecosystem integration

### Database
**Primary Recommendation**: PostgreSQL
- Structured data (students, meetings, attendance records)
- ACID compliance for reliable data
- Excellent JSON support for flexible metadata
- Strong query capabilities for reports

**Alternative**: MongoDB
- Good for flexible schemas
- Easy to start with
- Better if attendance data structure varies significantly

### Cloud Hosting (Recommended)
- **Azure App Service**: Native Microsoft integration
- **Azure SQL Database** or **Azure Cosmos DB**: Managed databases
- **Alternative**: Vercel (frontend) + Railway/Render (backend)

## Project Structure

```
attendance-tracker/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   ├── AttendanceTable/
│   │   │   ├── StudentList/
│   │   │   └── Reports/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Meetings.tsx
│   │   │   └── Students.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── auth.ts
│   │   ├── hooks/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── attendance.controller.ts
│   │   │   ├── meetings.controller.ts
│   │   │   └── students.controller.ts
│   │   ├── services/
│   │   │   ├── graph.service.ts
│   │   │   ├── attendance.service.ts
│   │   │   └── sync.service.ts
│   │   ├── models/
│   │   │   ├── Student.ts
│   │   │   ├── Meeting.ts
│   │   │   └── AttendanceRecord.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── routes/
│   │   │   ├── attendance.routes.ts
│   │   │   └── meetings.routes.ts
│   │   ├── config/
│   │   │   └── database.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
├── database/
│   └── migrations/
│       ├── 001_create_students.sql
│       ├── 002_create_meetings.sql
│       └── 003_create_attendance.sql
│
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── SETUP.md
│
└── README.md
```

## Database Schema

### Students Table
```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    student_id VARCHAR(50),
    azure_ad_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Meetings Table
```sql
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teams_meeting_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    organizer_email VARCHAR(255),
    meeting_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Attendance Records Table
```sql
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    join_time TIMESTAMP NOT NULL,
    leave_time TIMESTAMP,
    duration_minutes INTEGER,
    status VARCHAR(50), -- 'present', 'late', 'absent', 'partial'
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(meeting_id, student_id, join_time)
);
```

## Microsoft Graph API Integration

### Required API Permissions

Register your app in Azure AD with these permissions:

**Delegated Permissions** (user signs in):
- `OnlineMeetings.Read`
- `OnlineMeetings.ReadWrite`
- `Calendars.Read`
- `User.Read`
- `User.ReadBasic.All`

**Application Permissions** (background sync):
- `OnlineMeetings.Read.All`
- `CallRecords.Read.All`
- `User.Read.All`

### Key API Endpoints to Use

1. **Get Online Meetings**
   ```
   GET /users/{userId}/onlineMeetings
   GET /users/{userId}/calendar/events
   ```

2. **Get Attendance Reports**
   ```
   GET /users/{userId}/onlineMeetings/{meetingId}/attendanceReports
   GET /users/{userId}/onlineMeetings/{meetingId}/attendanceReports/{reportId}
   ```

3. **Get Attendance Records**
   ```
   GET /users/{userId}/onlineMeetings/{meetingId}/attendanceReports/{reportId}/attendanceRecords
   ```

## Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up development environment
- [ ] Create Azure AD app registration
- [ ] Initialize frontend and backend projects
- [ ] Set up database with migrations
- [ ] Implement Microsoft OAuth authentication
- [ ] Test Graph API connectivity

### Phase 2: Core Features (Week 3-4)
- [ ] Implement meeting data fetching from Teams
- [ ] Build attendance record sync service
- [ ] Create student management CRUD operations
- [ ] Develop basic dashboard UI
- [ ] Implement attendance table view

### Phase 3: Reporting (Week 5-6)
- [ ] Build attendance report generation
- [ ] Add filtering and search capabilities
- [ ] Create data export (CSV/Excel)
- [ ] Implement attendance statistics
- [ ] Add visualizations (charts, graphs)

### Phase 4: Polish & Deploy (Week 7-8)
- [ ] Add automated background sync
- [ ] Implement error handling and logging
- [ ] Write unit and integration tests
- [ ] Deploy to cloud hosting
- [ ] Documentation and user guide

## Key Features to Implement

### 1. Automated Sync
- Scheduled job to fetch attendance reports every hour
- Manual sync trigger option
- Conflict resolution for duplicate records

### 2. Dashboard Views
- Overview statistics (total meetings, avg attendance)
- Recent meetings list
- Students with poor attendance alerts
- Attendance trends over time

### 3. Reporting Capabilities
- Attendance by student (individual report cards)
- Attendance by meeting
- Date range filtering
- Export to CSV, Excel, PDF
- Attendance percentage calculations

### 4. Student Management
- Import students from CSV
- Sync with Azure AD users
- Manual student addition/editing
- Student grouping/classes

## Authentication Flow

1. User visits application
2. Redirected to Microsoft login
3. User authenticates with school Microsoft account
4. App receives OAuth token
5. Token used for Graph API calls
6. Refresh token stored securely for background sync

## Security Considerations

- Store secrets in environment variables
- Use HTTPS only in production
- Implement CORS properly
- Validate all user inputs
- Use parameterized database queries
- Implement rate limiting on API
- Store refresh tokens encrypted
- Implement role-based access (admin vs. viewer)

## Environment Variables

```env
# Backend
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/attendance
JWT_SECRET=your-secret-key

# Microsoft Azure AD
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_TENANT_ID=your-tenant-id
REDIRECT_URI=http://localhost:3001/auth/callback

# Frontend
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_AZURE_CLIENT_ID=your-client-id
```

## Alternative Approaches

### Simpler MVP Approach
If you want to start smaller:
- Use **Next.js** for full-stack (combines frontend + backend)
- Use **SQLite** for local development
- Skip automated sync initially, use manual refresh
- Focus on read-only attendance viewing first

### Enterprise Approach
For larger scale:
- Microservices architecture
- Redis for caching
- Message queue (RabbitMQ/Azure Service Bus)
- Containerization with Docker
- Kubernetes orchestration

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+ (or Docker)
- Microsoft 365 admin access
- Azure AD developer account

### Quick Start Commands
```bash
# Clone/create project
mkdir attendance-tracker && cd attendance-tracker

# Initialize backend
mkdir backend && cd backend
npm init -y
npm install express @microsoft/microsoft-graph-client @azure/msal-node pg dotenv
npm install -D typescript @types/node @types/express ts-node

# Initialize frontend
cd ..
npx create-react-app frontend --template typescript
cd frontend
npm install @azure/msal-react @azure/msal-browser @mui/material axios react-query
```

## Resources

- [Microsoft Graph API Documentation](https://learn.microsoft.com/en-us/graph/api/overview)
- [Teams Meeting Attendance Reports](https://learn.microsoft.com/en-us/graph/api/meetingattendancereport-get)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

## Conclusion

This architecture provides a scalable, maintainable solution for tracking Teams attendance. The TypeScript + React + Node.js stack offers excellent Microsoft integration while remaining flexible for future enhancements.

Start with the MVP approach and iterate based on user feedback and requirements.
