# Option 1: IT-Managed Azure Runbook Solution

This document explains how to implement the IT-managed approach where your school's IT department handles the data retrieval, and your app imports the data.

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Microsoft Teams                          │
│                  (Attendance Data)                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    (Daily/Weekly)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Azure Runbook (IT Managed)                     │
│  - Uses application permissions                             │
│  - Runs on schedule                                         │
│  - Exports to CSV/JSON                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
                  (Upload/Email)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│            SharePoint / Email / File Share                  │
│              (Data Storage Location)                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    (Import)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│           Your Desktop Application                          │
│  - Imports CSV files                                        │
│  - Displays dashboard                                       │
│  - Generates reports                                        │
└─────────────────────────────────────────────────────────────┘
```

## How It Works

### IT Department's Responsibilities

1. **Create Azure AD App with Application Permissions**
   - Register app in Azure Portal
   - Add `OnlineMeetings.Read.All` application permission
   - Add `CallRecords.Read.All` application permission
   - Grant admin consent
   - Create and secure client secret

2. **Create Azure Automation Runbook**
   - Write PowerShell/Python script to fetch attendance data
   - Schedule to run daily/weekly
   - Export data to CSV or JSON format

3. **Set Up Data Delivery**
   - Upload to SharePoint document library
   - Email CSV file as attachment
   - Save to network file share

### Your Responsibilities

1. **Modify Your App to Import Data**
   - Remove direct Teams API integration
   - Add file import functionality
   - Parse CSV/JSON files
   - Store in local database

2. **Access the Data**
   - Download from SharePoint
   - Check email for attachments
   - Access file share location

3. **Run Your Dashboard**
   - Import new files when available
   - View attendance reports
   - Export custom reports

## IT Department Setup Guide

### Part 1: Azure AD Application Setup

**What IT Needs to Do:**

1. **Go to Azure Portal** (portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations** → **New registration**
3. Fill in:
   ```
   Name: Teams Attendance Data Export
   Account types: Accounts in this organizational directory only
   Redirect URI: Leave blank (not needed for runbook)
   ```
4. Click **Register**

5. **Add API Permissions:**
   - Go to **API permissions** → **Add a permission** → **Microsoft Graph**
   - Select **Application permissions** (NOT Delegated)
   - Add:
     - `OnlineMeetings.Read.All`
     - `CallRecords.Read.All`
     - `User.Read.All`
     - `Calendars.Read` (if accessing calendar events)
   - Click **Grant admin consent for [Organization]**

6. **Create Client Secret:**
   - Go to **Certificates & secrets** → **New client secret**
   - Description: "Attendance Export Runbook"
   - Expiration: 24 months (max)
   - Click **Add**
   - **COPY AND SECURELY STORE** the secret value

7. **Note the Following IDs:**
   - Application (client) ID
   - Directory (tenant) ID
   - Client secret value

### Part 2: Azure Automation Runbook Setup

**Create Automation Account:**

1. In Azure Portal, search for **Automation Accounts**
2. Click **Create** → Fill in:
   ```
   Name: attendance-data-export
   Resource group: Create new or use existing
   Region: Choose closest region
   ```
3. Click **Review + Create** → **Create**

**Create Runbook:**

1. Go to your Automation Account
2. Navigate to **Runbooks** → **Create a runbook**
3. Fill in:
   ```
   Name: Export-TeamsAttendance
   Runbook type: PowerShell
   Runtime version: 7.2
   ```
4. Click **Create**

**Add the PowerShell Script:**

```powershell
<#
.SYNOPSIS
    Exports Teams meeting attendance data to CSV
.DESCRIPTION
    Retrieves attendance reports from Microsoft Teams meetings
    for the past X days and exports to CSV file
#>

param(
    [Parameter(Mandatory=$false)]
    [int]$DaysBack = 7
)

# Import required modules
Import-Module Microsoft.Graph.Authentication
Import-Module Microsoft.Graph.CloudCommunications

# Authentication
$tenantId = Get-AutomationVariable -Name 'TenantId'
$clientId = Get-AutomationVariable -Name 'ClientId'
$clientSecret = Get-AutomationVariable -Name 'ClientSecret' | ConvertTo-SecureString -AsPlainText -Force

$credential = New-Object System.Management.Automation.PSCredential($clientId, $clientSecret)

# Connect to Microsoft Graph
Connect-MgGraph -TenantId $tenantId -ClientSecretCredential $credential

Write-Output "Connected to Microsoft Graph"

# Calculate date range
$startDate = (Get-Date).AddDays(-$DaysBack).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$endDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")

Write-Output "Retrieving meetings from $startDate to $endDate"

# Get all users (to find meeting organizers)
$users = Get-MgUser -All -Property Id,Mail,DisplayName

$allAttendanceRecords = @()

# Loop through users and get their meetings
foreach ($user in $users) {
    Write-Output "Processing user: $($user.DisplayName)"

    try {
        # Get calendar events (meetings)
        $meetings = Get-MgUserEvent -UserId $user.Id -Filter "isOnlineMeeting eq true and start/dateTime ge '$startDate' and end/dateTime le '$endDate'"

        foreach ($meeting in $meetings) {
            Write-Output "  Processing meeting: $($meeting.Subject)"

            # Get online meeting details
            if ($meeting.OnlineMeeting) {
                try {
                    # Get attendance reports for this meeting
                    $attendanceReports = Get-MgUserOnlineMeetingAttendanceReport -UserId $user.Id -OnlineMeetingId $meeting.OnlineMeeting.Id

                    foreach ($report in $attendanceReports) {
                        # Get attendance records from the report
                        $attendanceRecords = Get-MgUserOnlineMeetingAttendanceReportAttendanceRecord -UserId $user.Id -OnlineMeetingId $meeting.OnlineMeeting.Id -MeetingAttendanceReportId $report.Id

                        foreach ($record in $attendanceRecords) {
                            # Process each attendance interval
                            foreach ($interval in $record.AttendanceIntervals) {
                                $attendanceData = [PSCustomObject]@{
                                    MeetingId = $meeting.Id
                                    MeetingTitle = $meeting.Subject
                                    MeetingStart = $meeting.Start.DateTime
                                    MeetingEnd = $meeting.End.DateTime
                                    OrganizerEmail = $user.Mail
                                    StudentName = $record.Identity.DisplayName
                                    StudentEmail = $record.EmailAddress
                                    AzureAdId = $record.Identity.Id
                                    JoinTime = $interval.JoinDateTime
                                    LeaveTime = $interval.LeaveDateTime
                                    DurationSeconds = $interval.DurationInSeconds
                                    Role = $record.Role
                                    ExportDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                                }

                                $allAttendanceRecords += $attendanceData
                            }
                        }
                    }
                }
                catch {
                    Write-Warning "Could not retrieve attendance for meeting: $($meeting.Subject). Error: $_"
                }
            }
        }
    }
    catch {
        Write-Warning "Could not process user: $($user.DisplayName). Error: $_"
    }
}

Write-Output "Total attendance records found: $($allAttendanceRecords.Count)"

# Export to CSV
$outputPath = "$env:TEMP\attendance-export-$(Get-Date -Format 'yyyyMMdd-HHmmss').csv"
$allAttendanceRecords | Export-Csv -Path $outputPath -NoTypeInformation

Write-Output "Data exported to: $outputPath"

# Upload to SharePoint (optional - configure SharePoint details)
# Or email the file (configure email settings)

# For now, output the file content
Get-Content $outputPath | Write-Output

# Disconnect
Disconnect-MgGraph

Write-Output "Script completed successfully"
```

**Configure Variables:**

1. In Automation Account, go to **Variables**
2. Create three encrypted variables:
   - **TenantId**: Your tenant ID
   - **ClientId**: Your application (client) ID
   - **ClientSecret**: Your client secret value

**Install Required Modules:**

1. Go to **Modules** → **Browse gallery**
2. Search and install:
   - `Microsoft.Graph.Authentication`
   - `Microsoft.Graph.CloudCommunications`
   - `Microsoft.Graph.Users`
   - `Microsoft.Graph.Calendar`

**Schedule the Runbook:**

1. Go to **Schedules** → **Add a schedule**
2. Fill in:
   ```
   Name: Daily-Attendance-Export
   Start: Tomorrow 6:00 AM
   Recurrence: Recurring
   Recur every: 1 Day
   ```
3. Click **Create**
4. Link schedule to your runbook

### Part 3: Data Delivery Options

**Option A: Upload to SharePoint**

Add to the end of your runbook:

```powershell
# SharePoint Upload
$siteUrl = "https://yourschool.sharepoint.com/sites/attendance"
$libraryName = "AttendanceData"
$fileName = "attendance-export-$(Get-Date -Format 'yyyyMMdd').csv"

# Upload using PnP PowerShell or Microsoft Graph
# Install-Module -Name PnP.PowerShell
Connect-PnPOnline -Url $siteUrl -ClientId $clientId -ClientSecret $clientSecret -Tenant $tenantId
Add-PnPFile -Path $outputPath -Folder $libraryName
```

**Option B: Email the File**

Add to the end of your runbook:

```powershell
# Email the CSV file
$emailParams = @{
    To = "teacher@school.edu"
    Subject = "Teams Attendance Report - $(Get-Date -Format 'yyyy-MM-dd')"
    Body = "Attached is the attendance report for the past $DaysBack days. Import this file into your attendance tracker application."
    Attachments = $outputPath
    SmtpServer = "smtp.office365.com"
    Port = 587
    UseSsl = $true
    Credential = $credential
}

Send-MailMessage @emailParams
```

**Option C: Save to File Share**

```powershell
# Save to network file share
$networkPath = "\\fileserver\attendance\exports\"
$destinationFile = Join-Path $networkPath "attendance-$(Get-Date -Format 'yyyyMMdd').csv"

Copy-Item -Path $outputPath -Destination $destinationFile -Force
Write-Output "File saved to: $destinationFile"
```

## Your App Modifications

### Changes Needed in Your Application

1. **Remove Direct Teams Integration**
   - Remove `graph.service.ts`
   - Remove `attendance.service.ts` sync methods
   - Keep database models and controllers

2. **Add File Import Functionality**

Create new file: `backend/src/services/import.service.ts`:

```typescript
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import { StudentModel } from '../models/Student';
import { MeetingModel } from '../models/Meeting';
import { AttendanceRecordModel } from '../models/AttendanceRecord';
import { AttendanceStatus } from '../types';
import logger from '../config/logger';

interface ImportedRecord {
  MeetingId: string;
  MeetingTitle: string;
  MeetingStart: string;
  MeetingEnd: string;
  OrganizerEmail: string;
  StudentName: string;
  StudentEmail: string;
  AzureAdId?: string;
  JoinTime: string;
  LeaveTime?: string;
  DurationSeconds: string;
  Role: string;
  ExportDate: string;
}

export class ImportService {
  async importFromCSV(filePath: string): Promise<{
    studentsCreated: number;
    meetingsCreated: number;
    recordsCreated: number;
  }> {
    try {
      // Read and parse CSV
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const records: ImportedRecord[] = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });

      logger.info(`Importing ${records.length} attendance records from CSV`);

      let studentsCreated = 0;
      let meetingsCreated = 0;
      let recordsCreated = 0;

      const processedMeetings = new Set<string>();
      const processedStudents = new Set<string>();

      for (const record of records) {
        // Create or get student
        if (!processedStudents.has(record.StudentEmail)) {
          let student = await StudentModel.findByEmail(record.StudentEmail);

          if (!student) {
            student = await StudentModel.create({
              email: record.StudentEmail,
              name: record.StudentName,
              azure_ad_id: record.AzureAdId,
            });
            studentsCreated++;
            logger.info(`Created student: ${student.email}`);
          }

          processedStudents.add(record.StudentEmail);
        }

        // Create or get meeting
        if (!processedMeetings.has(record.MeetingId)) {
          let meeting = await MeetingModel.findByTeamsMeetingId(record.MeetingId);

          if (!meeting) {
            meeting = await MeetingModel.create({
              teams_meeting_id: record.MeetingId,
              title: record.MeetingTitle,
              start_time: new Date(record.MeetingStart),
              end_time: new Date(record.MeetingEnd),
              organizer_email: record.OrganizerEmail,
            });
            meetingsCreated++;
            logger.info(`Created meeting: ${meeting.title}`);
          }

          processedMeetings.add(record.MeetingId);
        }

        // Create attendance record
        const student = await StudentModel.findByEmail(record.StudentEmail);
        const meeting = await MeetingModel.findByTeamsMeetingId(record.MeetingId);

        if (student && meeting) {
          const joinTime = new Date(record.JoinTime);
          const leaveTime = record.LeaveTime ? new Date(record.LeaveTime) : undefined;
          const durationMinutes = Math.floor(parseInt(record.DurationSeconds) / 60);

          // Determine status
          const meetingStart = new Date(record.MeetingStart);
          const latencyMinutes = (joinTime.getTime() - meetingStart.getTime()) / (1000 * 60);

          let status: AttendanceStatus;
          if (latencyMinutes > 15) {
            status = AttendanceStatus.LATE;
          } else if (durationMinutes < 5) {
            status = AttendanceStatus.PARTIAL;
          } else {
            status = AttendanceStatus.PRESENT;
          }

          // Check if record already exists
          const existing = await AttendanceRecordModel.findByStudentAndMeeting(
            student.id,
            meeting.id
          );

          if (existing.length === 0) {
            await AttendanceRecordModel.create({
              meeting_id: meeting.id,
              student_id: student.id,
              join_time: joinTime,
              leave_time: leaveTime,
              duration_minutes: durationMinutes,
              status,
            });
            recordsCreated++;
          }
        }
      }

      logger.info(`Import complete: ${studentsCreated} students, ${meetingsCreated} meetings, ${recordsCreated} records`);

      return { studentsCreated, meetingsCreated, recordsCreated };
    } catch (error) {
      logger.error('Failed to import CSV:', error);
      throw error;
    }
  }
}

export const importService = new ImportService();
```

3. **Add Import Controller**

Create `backend/src/controllers/import.controller.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { importService } from '../services/import.service';
import multer from 'multer';
import path from 'path';
import logger from '../config/logger';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `import-${Date.now()}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

export const importCSV = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
      return;
    }

    logger.info(`Importing file: ${req.file.filename}`);

    const result = await importService.importFromCSV(req.file.path);

    res.json({
      success: true,
      message: 'Data imported successfully',
      data: result,
    });
  } catch (error) {
    logger.error('Error in importCSV:', error);
    next(error);
  }
};
```

4. **Add Import Route**

Create `backend/src/routes/import.routes.ts`:

```typescript
import { Router } from 'express';
import { importCSV, upload } from '../controllers/import.controller';

const router = Router();

router.post('/', upload.single('file'), importCSV);

export default router;
```

5. **Update Frontend - Add Import Page**

Create `frontend/src/pages/ImportPage.tsx`:

```typescript
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  LinearProgress,
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import axios from 'axios';

const ImportPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        'http://localhost:3001/api/import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setResult(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to import file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Import Attendance Data
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Upload CSV file from IT department
      </Typography>

      <Paper elevation={2} sx={{ p: 3, maxWidth: 600 }}>
        <Box sx={{ mb: 3 }}>
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="csv-file-input"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="csv-file-input">
            <Button variant="outlined" component="span" fullWidth>
              Choose CSV File
            </Button>
          </label>
          {file && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected: {file.name}
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={handleImport}
          disabled={!file || loading}
          fullWidth
        >
          {loading ? 'Importing...' : 'Import Data'}
        </Button>

        {loading && <LinearProgress sx={{ mt: 2 }} />}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Successfully imported:
            </Typography>
            <ul>
              <li>{result.studentsCreated} new students</li>
              <li>{result.meetingsCreated} new meetings</li>
              <li>{result.recordsCreated} attendance records</li>
            </ul>
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default ImportPage;
```

## Usage Workflow

### For You (The Teacher)

**Daily/Weekly Process:**

1. **Receive Data** (automatically from IT):
   - Check SharePoint folder for new CSV file
   - OR check email for CSV attachment
   - OR access network file share

2. **Import Data** into your app:
   - Open your attendance tracker app
   - Click "Import Data" in sidebar
   - Select the CSV file
   - Click "Import"

3. **View Reports**:
   - Go to Dashboard to see statistics
   - Browse Students and Meetings
   - Generate custom reports
   - Export to CSV if needed

### For IT Department

**One-Time Setup:**
- Configure Azure AD app (30 minutes)
- Create automation runbook (1 hour)
- Set up data delivery (30 minutes)
- **Total: ~2 hours**

**Ongoing Maintenance:**
- Monitor runbook execution (5 minutes/week)
- Renew client secret every 24 months
- Update script if Microsoft changes API

## Advantages of This Approach

✅ **Security**: IT controls org-wide access
✅ **Compliance**: Follows school security policy
✅ **Automated**: Runs on schedule without manual intervention
✅ **Scalable**: Works for all teachers, all meetings
✅ **Maintainable**: IT manages one central system
✅ **Reliable**: Azure handles scheduling and execution

## Disadvantages

❌ **Not Real-Time**: Data is delayed by schedule (daily/weekly)
❌ **IT Dependency**: Requires IT setup and maintenance
❌ **Less Flexible**: Can't sync on-demand whenever you want
❌ **Troubleshooting**: Requires IT support if issues arise

## Cost Considerations

**Azure Automation:**
- First 500 minutes/month: FREE
- After that: ~$0.002 per minute
- **Estimated cost**: $0-5/month for daily runs

**Storage:**
- SharePoint: Included with Microsoft 365
- File share: Depends on school infrastructure

**Total Cost**: Essentially FREE

## Support Documentation for IT

**Microsoft Resources:**
- [Azure Automation Docs](https://docs.microsoft.com/en-us/azure/automation/)
- [Microsoft Graph PowerShell SDK](https://docs.microsoft.com/en-us/powershell/microsoftgraph/)
- [Get Attendance Reports](https://docs.microsoft.com/en-us/graph/api/meetingattendancereport-get)

**Example IT Ticket Template:**

```
Subject: Request for Teams Attendance Data Export Automation

Description:
I need IT assistance to set up an automated export of Teams meeting
attendance data. I have built an application to track and report on
student attendance, but our security policy requires that org-wide
API access be managed by IT.

Requirements:
- Daily export of Teams meeting attendance data
- Past 7 days of attendance records
- Output: CSV format
- Delivery: SharePoint/Email/File Share

I can provide:
- Detailed technical documentation
- PowerShell script template
- Required API permissions list
- Import functionality in my application

Benefits:
- Automated attendance tracking for all classes
- Reduced manual reporting work
- Better insights into student engagement
- Complies with IT security policies

Can we schedule a meeting to discuss implementation?
```

## Conclusion

This approach gives you a robust, IT-managed solution that:
- Works within your school's security policies
- Provides automated data delivery
- Scales to all teachers and classes
- Requires minimal ongoing maintenance

While it's not real-time, for most attendance tracking use cases, daily updates are perfectly sufficient.

**Keep this document for future reference** if you decide to switch from Option 2 (delegated permissions) to this IT-managed approach.
