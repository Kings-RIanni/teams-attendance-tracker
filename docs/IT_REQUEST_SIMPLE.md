# IT Request: Teams Attendance Data Export

## Request Summary
I'm building an attendance tracking application for managing student attendance in Microsoft Teams meetings. I need the IT department's help to set up an automated system to export attendance data from Teams.

## What I Need

I need attendance data from Microsoft Teams meetings exported to a CSV file that I can download. The CSV should contain the following information:

- Meeting ID
- Meeting Title
- Meeting Start/End Times
- Student Email
- Student Name
- Join Time
- Leave Time
- Duration in Minutes

## Proposed Solution

Based on the detailed documentation in [OPTION1_IT_RUNBOOK.md](./OPTION1_IT_RUNBOOK.md), I understand this could be set up as:

1. An Azure AD app registration with appropriate permissions
2. An Azure Automation runbook that runs on a schedule (daily/weekly)
3. The runbook exports attendance data to CSV
4. CSV is delivered via SharePoint folder or email

## CSV Format Required

```csv
meeting_id,meeting_title,meeting_start,meeting_end,student_email,student_name,join_time,leave_time,duration_minutes
```

Example:
```csv
19:meeting_abc123,Math Class,2024-01-15T10:00:00Z,2024-01-15T11:00:00Z,john.doe@school.edu,John Doe,2024-01-15T10:02:00Z,2024-01-15T10:58:00Z,56
```

## Benefits

- No client secrets or credentials leave IT's control
- Automated data extraction on IT's schedule
- Secure handling of organizational data
- I only receive CSV files with the data I need

## Technical Details

For full implementation details, please see the comprehensive guide:
- [docs/OPTION1_IT_RUNBOOK.md](./OPTION1_IT_RUNBOOK.md)

This document includes:
- Complete PowerShell script for the runbook
- Required Azure AD permissions
- Step-by-step setup instructions
- Security considerations

## Questions?

I'm happy to discuss this request and provide any additional information needed. The detailed documentation should answer most technical questions.

Thank you for considering this request!
