import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Stack,
} from '@mui/material';
import {
  Sync as SyncIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';

const SyncPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [daysBack, setDaysBack] = useState('7');
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Enter Details', 'Syncing Data', 'Complete'];

  const handleSync = async () => {
    if (!userEmail.trim()) {
      setError('Please enter your Microsoft 365 email');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setActiveStep(1);

      await apiService.syncRecentAttendance({
        user_id: userEmail,
        days_back: parseInt(daysBack) || 7,
      });

      setSuccess(`Successfully synced attendance data for the last ${daysBack} days!`);
      setActiveStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to sync data');
      setActiveStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setSuccess(null);
    setError(null);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Sync Attendance Data
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Pull attendance data from Microsoft Teams meetings
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Sync Configuration
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {activeStep === 0 && (
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Your Microsoft 365 Email"
                placeholder="user@organization.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
                helperText="Enter the email of the meeting organizer or participant"
              />
              <TextField
                fullWidth
                label="Days to Sync"
                type="number"
                value={daysBack}
                onChange={(e) => setDaysBack(e.target.value)}
                inputProps={{ min: 1, max: 30 }}
                helperText="Number of days back to sync (1-30)"
              />
              <Button
                variant="contained"
                size="large"
                startIcon={<SyncIcon />}
                onClick={handleSync}
                disabled={loading}
                fullWidth
              >
                {loading ? 'Syncing...' : 'Sync Attendance'}
              </Button>
            </Stack>
          )}

          {activeStep === 1 && (
            <Box textAlign="center" py={4}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Syncing data from Teams...
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                This may take a few moments
              </Typography>
              <LinearProgress sx={{ mt: 3 }} />
            </Box>
          )}

          {activeStep === 2 && (
            <Box textAlign="center" py={4}>
              <CheckCircleIcon color="success" sx={{ fontSize: 80 }} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Sync Complete!
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 3 }}>
                {success}
              </Typography>
              <Button variant="outlined" onClick={handleReset}>
                Sync Again
              </Button>
            </Box>
          )}
        </Paper>

        <Box>
          <Card elevation={2} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                How It Works
              </Typography>
              <Box component="ol" sx={{ pl: 2 }}>
                <Typography component="li" variant="body2" paragraph>
                  <strong>Enter your email:</strong> Use the Microsoft 365 email address
                  that has access to the Teams meetings
                </Typography>
                <Typography component="li" variant="body2" paragraph>
                  <strong>Choose date range:</strong> Select how many days back you want to
                  sync (up to 30 days)
                </Typography>
                <Typography component="li" variant="body2" paragraph>
                  <strong>Click Sync:</strong> The app will fetch all meetings and attendance
                  records from Microsoft Teams
                </Typography>
                <Typography component="li" variant="body2" paragraph>
                  <strong>View data:</strong> Once complete, view students, meetings, and
                  attendance reports in the dashboard
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="warning.main">
                Important Notes
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" variant="body2" paragraph>
                  Ensure your Azure AD app has proper permissions configured
                </Typography>
                <Typography component="li" variant="body2" paragraph>
                  Only meetings with attendance reports will be synced
                </Typography>
                <Typography component="li" variant="body2" paragraph>
                  The first sync may take longer depending on the number of meetings
                </Typography>
                <Typography component="li" variant="body2" paragraph>
                  Students will be automatically created from meeting participants
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default SyncPage;
