# Option 2: Delegated Permissions Setup (User-Level Access)

This is the **recommended approach** for getting started quickly. You'll authenticate with YOUR Microsoft 365 account and track attendance for meetings YOU organize or attend.

## What This Means

✅ **You're in control** - No need to wait for IT
✅ **Works immediately** - Set up in 15 minutes
✅ **Follows policy** - No org-wide access required
✅ **No client secrets** - Uses interactive login
✅ **Real-time sync** - Pull data whenever you want

❌ **Limitation**: Only YOUR meetings (ones you organize or attend)

## How It Works

```
You sign in with YOUR Microsoft 365 account
         ↓
App gets YOUR permission to read YOUR meetings
         ↓
App pulls attendance from meetings YOU host
         ↓
Data stored in local database
         ↓
View in dashboard, generate reports
```

## Setup Instructions

### Step 1: Azure AD App Registration (10 minutes)

**1. Go to Azure Portal**
- Visit: https://portal.azure.com
- Sign in with your school Microsoft 365 account

**2. Register Application**
- Navigate to: **Azure Active Directory** → **App registrations**
- Click: **New registration**
- Fill in:
  ```
  Name: My Teams Attendance Tracker
  Account types: Accounts in this organizational directory only
  Redirect URI:
    Platform: Single-page application (SPA)
    URI: http://localhost:3000
  ```
- Click: **Register**

**3. Add Delegated Permissions ONLY**
- Go to: **API permissions**
- Click: **Add a permission** → **Microsoft Graph**
- Select: **Delegated permissions** (NOT Application permissions)
- Add these permissions:
  - ✅ `User.Read`
  - ✅ `OnlineMeetings.Read`
  - ✅ `Calendars.Read`
  - ✅ `OnlineMeetingArtifact.Read.All` (for attendance reports)
- Click: **Add permissions**

**IMPORTANT**: You do NOT need admin consent for delegated permissions! They work with user consent.

**4. Enable Public Client Flow** (Optional, for better authentication)
- Go to: **Authentication**
- Scroll to: **Advanced settings**
- Enable: **Allow public client flows** → **Yes**
- Click: **Save**

**5. Note Your IDs**
From the **Overview** page, copy:
- ✅ Application (client) ID
- ✅ Directory (tenant) ID

**YOU DO NOT NEED A CLIENT SECRET** for this approach!

### Step 2: Configure Your Application (5 minutes)

**Backend Configuration:**

Edit `backend/.env`:
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/attendance_tracker

# Azure AD - Delegated Permissions
AZURE_CLIENT_ID=your-client-id-here
AZURE_TENANT_ID=your-tenant-id-here
# NO CLIENT SECRET NEEDED!

# You don't need REDIRECT_URI for delegated flow
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

**Frontend Configuration:**

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_AZURE_CLIENT_ID=your-client-id-here
REACT_APP_AZURE_TENANT_ID=your-tenant-id-here
REACT_APP_REDIRECT_URI=http://localhost:3000
```

### Step 3: Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

### Step 4: Sign In and Sync

1. **Open** http://localhost:3000
2. **You'll be prompted** to sign in with Microsoft
3. **Sign in** with YOUR school email
4. **Grant permissions** when asked
5. **Go to Sync Data** page
6. **Enter YOUR email** address
7. **Click Sync** - it will pull YOUR meetings!

## Key Differences from Option 1

| Feature | Option 1 (IT Runbook) | Option 2 (Delegated) |
|---------|----------------------|---------------------|
| **Setup Time** | 2+ hours (IT required) | 15 minutes (self-service) |
| **Data Access** | All teachers' meetings | Only YOUR meetings |
| **IT Approval** | Required | Not required |
| **Client Secret** | Required (IT manages) | Not needed |
| **Real-time Sync** | No (scheduled) | Yes (on-demand) |
| **Permissions Type** | Application | Delegated |
| **Admin Consent** | Required | Not required |
| **Maintenance** | IT handles | You handle |

## What Meetings Can You Access?

With delegated permissions, you can access attendance for:

✅ Meetings YOU organize
✅ Meetings YOU attend/co-present
✅ Recurring meetings YOU host
✅ Channel meetings in teams YOU're in

❌ Other teachers' meetings (unless you're invited)
❌ Org-wide meetings you don't attend
❌ Meetings from before you were added

## Authentication Flow Explained

### Traditional Flow (What we're REMOVING):
```
Backend has client secret
     ↓
Backend authenticates to Microsoft
     ↓
Backend gets org-wide access
     ↓
Backend pulls all data
     ↓
Frontend displays it
```

### New Delegated Flow (What we're USING):
```
You sign in via frontend
     ↓
Microsoft shows permission consent
     ↓
You click "Accept"
     ↓
Frontend gets YOUR access token
     ↓
Frontend sends token to backend
     ↓
Backend uses YOUR token to get YOUR meetings
     ↓
Data displayed in dashboard
```

## Security Considerations

### What IT Will Like:
✅ No org-wide access granted
✅ No client secrets to secure
✅ User controls their own data
✅ Permissions can be revoked anytime
✅ Audit trail shows YOUR actions

### What You Should Know:
⚠️ Your access token expires every hour (auto-refreshes)
⚠️ If you revoke permissions, app stops working
⚠️ Each user needs to sign in individually
⚠️ Can't access other teachers' data

## Troubleshooting

### "Need admin approval"
**Solution**: Your IT has restricted which apps can be used. Ask them to:
- Add your app to the approved list
- OR disable user consent restriction for your account
- This is different from needing admin consent - it's about user consent being disabled

### "Cannot read meetings"
**Checklist**:
- ✅ Did you add all delegated permissions?
- ✅ Did you sign in with your school account?
- ✅ Do you actually organize any Teams meetings?
- ✅ Are attendance reports enabled in those meetings?

### "No attendance data found"
**Reasons**:
- Meeting doesn't have attendance report yet (happens after meeting ends)
- You weren't the organizer or co-presenter
- Meeting was too long ago (>60 days)
- Attendance reporting was disabled for that meeting

### "Token expired"
**Solution**: The app should auto-refresh. If not:
- Sign out and sign back in
- Clear browser cache
- Restart the app

## Scaling This Approach

### If Other Teachers Want Access:

**Option A**: Each teacher runs their own instance
- They clone the code
- Set up their own local copy
- Each tracks their own meetings

**Option B**: Multi-user deployment
- Deploy to a shared server
- Each teacher signs in with their account
- Each sees only their own data

**Option C**: Move to Option 1
- Prove the value with your data
- Show IT the working app
- Request they set up the IT-managed runbook
- Transition to org-wide access

## Testing Your Setup

### Quick Test:

1. **Create a test meeting** in Teams
2. **Invite a few people**
3. **Hold a short meeting** (5 minutes)
4. **End the meeting**
5. **Wait 15-30 minutes** (for attendance report to generate)
6. **Sync in your app**
7. **Check dashboard** - you should see:
   - The meeting listed
   - Attendees as students
   - Attendance records

### What Success Looks Like:

```
✅ Sign in works
✅ No errors during sync
✅ Your meetings appear in Meetings page
✅ Attendees appear in Students page
✅ Attendance records appear in Reports page
✅ Dashboard shows statistics
```

## Next Steps After Setup

1. **Test with real data** - Let it run for a week
2. **Show your IT department** - Demonstrate it works safely
3. **Share with colleagues** - Help them set up their own
4. **Provide feedback to IT** - If it's valuable, request Option 1
5. **Customize** - Add features specific to your needs

## Limitations to Be Aware Of

### Data Limitations:
- Only meetings YOU have access to
- Historical limit: ~60 days back
- Attendance reports only after meeting ends
- Can't access deleted meetings

### Technical Limitations:
- Must stay signed in
- Token refreshes every hour
- Network connection required for sync
- No offline mode

### Scale Limitations:
- One user per installation
- Can't share with other teachers easily
- Each person needs their own setup
- No centralized reporting across teachers

## When to Switch to Option 1

Consider asking IT for Option 1 (runbook) if:

✅ Multiple teachers want to use it
✅ You need data from all school meetings
✅ You want automated daily updates
✅ You've proven the value with your data
✅ IT has time to set it up

## Communicating with IT

**Email Template:**

```
Subject: Using Teams Attendance Tracker with Delegated Permissions

Hi IT Team,

Following up on our previous discussion about the Teams Attendance
Tracker app. To get started quickly while following security policies,
I'd like to use the app with delegated permissions only.

Setup:
- Azure AD app with ONLY delegated permissions (no application permissions)
- No client secrets needed
- I sign in with MY account
- Only accesses MY meetings

This approach:
✅ Doesn't require admin consent
✅ Doesn't access org-wide data
✅ Follows your security policies
✅ Lets me test the value before requesting broader access

I've reviewed the delegated permissions needed:
- User.Read
- OnlineMeetings.Read
- Calendars.Read
- OnlineMeetingArtifact.Read.All

Is this approach acceptable? I can set it up myself without requiring
IT support. If it proves valuable, we can discuss the IT-managed runbook
approach (Option 1) for broader deployment.

Thanks!
```

## Summary

**Option 2 is perfect for:**
- Getting started quickly
- Proving the concept
- Tracking your own classes
- Learning the system
- Building support for broader adoption

**You can always switch to Option 1 later!**

Start with this, prove it works, then ask IT to scale it up if needed.

---

**Ready to start?** Follow [QUICKSTART.md](../QUICKSTART.md) with the Azure AD setup above!
