import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { apiService } from '../services/api';
import { Meeting } from '../types';
import { format } from 'date-fns';

const Meetings: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getMeetings(100, 0);
      setMeetings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const getMeetingStatus = (meeting: Meeting) => {
    const now = new Date();
    const start = new Date(meeting.start_time);
    const end = new Date(meeting.end_time);

    if (now < start) {
      return { label: 'Upcoming', color: 'primary' as const };
    } else if (now >= start && now <= end) {
      return { label: 'In Progress', color: 'success' as const };
    } else {
      return { label: 'Completed', color: 'default' as const };
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Meetings
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        View all Teams meetings
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Title</strong></TableCell>
              <TableCell><strong>Start Time</strong></TableCell>
              <TableCell><strong>End Time</strong></TableCell>
              <TableCell><strong>Organizer</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {meetings.length > 0 ? (
              meetings.map((meeting) => {
                const status = getMeetingStatus(meeting);
                return (
                  <TableRow key={meeting.id} hover>
                    <TableCell>{meeting.title || 'Untitled Meeting'}</TableCell>
                    <TableCell>
                      {format(new Date(meeting.start_time), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(meeting.end_time), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{meeting.organizer_email || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip label={status.label} color={status.color} size="small" />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Attendance">
                        <IconButton size="small" color="primary">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="textSecondary" py={4}>
                    No meetings found. Sync data from Teams to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Meetings;
