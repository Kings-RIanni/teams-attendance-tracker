# Quick Start Guide - Teams Attendance Tracker

Get your Teams Attendance Tracker running in minutes!

## Prerequisites Checklist

- ✅ Node.js 18+ installed
- ✅ PostgreSQL 14+ installed and running
- ✅ Microsoft 365 account with admin access
- ✅ Git installed

## Step 1: Azure AD Setup (10 minutes)

### Create Azure AD App

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations** → **New registration**
3. Fill in:
   - Name: `Teams Attendance Tracker`
   - Account types: `Accounts in this organizational directory only`
   - Redirect URI: `http://localhost:3001/auth/callback`
4. Click **Register**

### Configure Permissions

1. Go to **API permissions** → **Add a permission** → **Microsoft Graph**
2. Add **Delegated permissions**:
   - User.Read
   - OnlineMeetings.Read
   - Calendars.Read
3. Add **Application permissions**:
   - OnlineMeetings.Read.All
   - CallRecords.Read.All
   - User.Read.All
4. Click **Grant admin consent for [Organization]**

### Get Credentials

1. Go to **Overview** page, copy:
   - Application (client) ID
   - Directory (tenant) ID
2. Go to **Certificates & secrets** → **New client secret**
3. Add description, click **Add**, **COPY THE SECRET VALUE**

## Step 2: Database Setup (2 minutes)

```bash
# Create database
createdb attendance_tracker

# Run migrations
cd database
psql attendance_tracker < migrations/001_create_students.sql
psql attendance_tracker < migrations/002_create_meetings.sql
psql attendance_tracker < migrations/003_create_attendance.sql
```

## Step 3: Backend Configuration (3 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file (use your favorite editor)
nano .env
```

Update your `.env` file with your Azure credentials:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/attendance_tracker

# Paste your Azure credentials here
AZURE_CLIENT_ID=paste-your-client-id-here
AZURE_CLIENT_SECRET=paste-your-secret-here
AZURE_TENANT_ID=paste-your-tenant-id-here
REDIRECT_URI=http://localhost:3001/auth/callback

# Generate a random secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

## Step 4: Frontend Configuration (2 minutes)

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file
nano .env
```

Update your frontend `.env`:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_AZURE_CLIENT_ID=paste-same-client-id-here
REACT_APP_AZURE_TENANT_ID=paste-same-tenant-id-here
REACT_APP_REDIRECT_URI=http://localhost:3000
```

## Step 5: Start the Application (1 minute)

### Terminal 1 - Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 3001
📊 Environment: development
```

### Terminal 2 - Start Frontend

```bash
cd frontend
npm start
```

Browser should automatically open to `http://localhost:3000`

## Step 6: Sync Your First Data (2 minutes)

1. Click **Sync Data** in the sidebar
2. Enter your Microsoft 365 email (e.g., `teacher@school.edu`)
3. Set days to sync (start with `7`)
4. Click **Sync Attendance**
5. Wait for sync to complete

## Step 7: Explore Your Data

- **Dashboard**: View statistics and recent meetings
- **Students**: See all students automatically created from meetings
- **Meetings**: Browse all synced Teams meetings
- **Reports**: Generate and export attendance reports

## Troubleshooting

### "Failed to connect to database"
```bash
# Check if PostgreSQL is running
pg_ctl status

# Or start it
pg_ctl start
```

### "Authentication failed"
- Double-check your Azure Client ID and Secret in `.env`
- Ensure admin consent was granted in Azure Portal
- Wait 5-10 minutes after granting permissions

### "No meetings found"
- Ensure the email you entered has access to Teams meetings
- Check that meetings have attendance reports enabled
- Try a longer date range (14-30 days)

### Port already in use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change PORT in backend/.env to 3002
```

## Common Commands

```bash
# Backend
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server

# Frontend
cd frontend
npm start           # Start development server
npm run build       # Build for production

# Database
psql attendance_tracker                     # Connect to database
psql attendance_tracker -c "SELECT COUNT(*) FROM students;"  # Count students
```

## What's Next?

1. **Add Students Manually**: Go to Students page, click "Add Student"
2. **Export Reports**: Use Reports page to filter and export CSV
3. **Schedule Regular Syncs**: Set up a cron job or Windows Task Scheduler
4. **Customize**: Modify the code to fit your specific needs

## Need Help?

- Check the [Full Setup Guide](docs/SETUP.md)
- Review the [Technical Design](TECHNICAL_DESIGN.md)
- Open an issue on [GitHub](https://github.com/Kings-RIanni/teams-attendance-tracker/issues)

## Security Reminders

- Never commit `.env` files to git
- Keep your Azure client secret secure
- Use strong PostgreSQL passwords
- Only run this on trusted networks

---

**Total Setup Time**: ~20 minutes

**Enjoy tracking your Teams attendance!** 🎉
