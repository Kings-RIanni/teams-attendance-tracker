# Setup Guide - Teams Attendance Tracker

This guide will walk you through setting up the Teams Attendance Tracker desktop application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Microsoft 365 Account** with admin access
- **Git** ([Download](https://git-scm.com/))

## Step 1: Azure AD Application Registration

### 1.1 Create Azure AD App

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Fill in the details:
   - **Name**: Teams Attendance Tracker
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: Web → `http://localhost:3001/auth/callback`
5. Click **Register**

### 1.2 Configure API Permissions

1. In your app, go to **API permissions**
2. Click **Add a permission** → **Microsoft Graph** → **Delegated permissions**
3. Add these permissions:
   - `User.Read`
   - `OnlineMeetings.Read`
   - `OnlineMeetings.ReadWrite`
   - `Calendars.Read`
   - `User.ReadBasic.All`

4. Click **Add a permission** → **Microsoft Graph** → **Application permissions**
5. Add these permissions:
   - `OnlineMeetings.Read.All`
   - `CallRecords.Read.All`
   - `User.Read.All`

6. Click **Grant admin consent for [Your Organization]**

### 1.3 Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add description: "Desktop App Secret"
4. Set expiration (recommend 24 months)
5. Click **Add**
6. **COPY THE SECRET VALUE** - you won't see it again!

### 1.4 Note Your Credentials

From the **Overview** page, copy:
- **Application (client) ID**
- **Directory (tenant) ID**

## Step 2: Database Setup

### 2.1 Create PostgreSQL Database

```bash
# Create database
createdb attendance_tracker

# Or using psql
psql -U postgres
CREATE DATABASE attendance_tracker;
\q
```

### 2.2 Run Database Migrations

```bash
cd database

# Run migrations in order
psql attendance_tracker < migrations/001_create_students.sql
psql attendance_tracker < migrations/002_create_meetings.sql
psql attendance_tracker < migrations/003_create_attendance.sql
```

Verify tables were created:
```bash
psql attendance_tracker
\dt
# You should see: students, meetings, attendance_records
\q
```

## Step 3: Backend Configuration

### 3.1 Install Backend Dependencies

```bash
cd backend
npm install
```

### 3.2 Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file
nano .env  # or use your preferred editor
```

Update the `.env` file with your values:

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Database (update with your PostgreSQL credentials)
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/attendance_tracker

# Azure AD Configuration (from Step 1.4)
AZURE_CLIENT_ID=your-client-id-here
AZURE_CLIENT_SECRET=your-client-secret-here
AZURE_TENANT_ID=your-tenant-id-here
REDIRECT_URI=http://localhost:3001/auth/callback

# JWT Configuration
JWT_SECRET=generate-a-random-string-here

# Application Settings
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug

# Sync Settings
SYNC_INTERVAL_MINUTES=60
```

**To generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.3 Build Backend

```bash
npm run build
```

## Step 4: Frontend Setup (Coming Soon)

The React frontend will be set up in the next phase.

## Step 5: Running the Application

### Development Mode (with hot reload)

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 3001
📊 Environment: development
🔗 API: http://localhost:3001/api
❤️  Health check: http://localhost:3001/health
```

### Production Mode

```bash
cd backend
npm run build
npm start
```

## Step 6: Testing the Setup

### 6.1 Test Health Endpoint

Open your browser or use curl:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

### 6.2 Test Authentication

1. Get the auth URL:
```bash
curl http://localhost:3001/auth/login
```

2. Open the `authUrl` in your browser
3. Sign in with your Microsoft 365 account
4. You'll be redirected back to the callback URL

### 6.3 Test API Endpoints

```bash
# Get all students
curl http://localhost:3001/api/students

# Get all meetings
curl http://localhost:3001/api/meetings

# Create a student
curl -X POST http://localhost:3001/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "name": "John Doe",
    "student_id": "12345"
  }'
```

## Common Issues & Solutions

### Issue: Database connection error

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
- Ensure PostgreSQL is running: `pg_ctl status`
- Check your DATABASE_URL in `.env`
- Verify database exists: `psql -l | grep attendance_tracker`

### Issue: Azure authentication fails

**Error:** `AADSTS700016: Application not found`

**Solution:**
- Double-check your AZURE_CLIENT_ID
- Ensure the redirect URI matches exactly
- Verify app registration is in the correct tenant

### Issue: Missing permissions

**Error:** `Insufficient privileges to complete the operation`

**Solution:**
- Ensure admin consent was granted for all API permissions
- Check that you're using an admin account
- Wait 5-10 minutes after granting consent

### Issue: Port already in use

**Error:** `EADDRINUSE: address already in use :::3001`

**Solution:**
```bash
# Find and kill the process using port 3001
lsof -ti:3001 | xargs kill -9

# Or change PORT in .env to 3002
```

## Next Steps

1. **Test Data Sync**: Once authenticated, test syncing meetings from Teams
2. **Frontend Setup**: Build the React dashboard (coming in next phase)
3. **Data Exploration**: Use the API to explore your attendance data
4. **Export Data**: Test CSV export functionality

## Useful Commands

```bash
# Backend development
cd backend
npm run dev          # Start with hot reload
npm run build        # Build TypeScript
npm start           # Start production server
npm run lint        # Check code quality
npm run lint:fix    # Fix linting issues

# Database
psql attendance_tracker                    # Connect to database
psql attendance_tracker -c "SELECT * FROM students;"  # Query students
```

## Getting Help

- Check the [API Documentation](./API.md)
- Review the [Technical Design](../TECHNICAL_DESIGN.md)
- Open an issue on GitHub

## Security Notes

- Never commit your `.env` file
- Keep your Azure client secret secure
- Use strong passwords for PostgreSQL
- Regularly rotate your client secrets (Azure AD)
