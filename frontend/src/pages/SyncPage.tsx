import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Description as FileIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';

const SyncPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);

  const steps = ['Select CSV File', 'Importing Data', 'Complete'];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setActiveStep(0);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setActiveStep(1);

      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await apiService.importAttendanceCSV(formData);

      setImportResult(response.data);
      setSuccess(response.message);
      setActiveStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to import CSV');
      setActiveStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setSuccess(null);
    setError(null);
    setSelectedFile(null);
    setImportResult(null);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Import Attendance Data
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Upload CSV file with attendance data from IT department
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            CSV File Import
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
            <Box>
              <input
                accept=".csv"
                style={{ display: 'none' }}
                id="csv-file-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="csv-file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  fullWidth
                  size="large"
                  sx={{ mb: 2 }}
                >
                  Select CSV File
                </Button>
              </label>

              {selectedFile && (
                <Alert severity="info" icon={<FileIcon />} sx={{ mb: 2 }}>
                  <strong>Selected file:</strong> {selectedFile.name} (
                  {(selectedFile.size / 1024).toFixed(2)} KB)
                </Alert>
              )}

              <Button
                variant="contained"
                size="large"
                startIcon={<UploadIcon />}
                onClick={handleImport}
                disabled={!selectedFile || loading}
                fullWidth
              >
                {loading ? 'Importing...' : 'Import Attendance Data'}
              </Button>
            </Box>
          )}

          {activeStep === 1 && (
            <Box textAlign="center" py={4}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Importing attendance data...
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Processing CSV file and creating records
              </Typography>
              <LinearProgress sx={{ mt: 3 }} />
            </Box>
          )}

          {activeStep === 2 && importResult && (
            <Box>
              <Box textAlign="center" py={2}>
                <CheckCircleIcon color="success" sx={{ fontSize: 80 }} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Import Complete!
                </Typography>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <strong>Meetings Created:</strong>
                      </TableCell>
                      <TableCell align="right">{importResult.meetings}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Students Created:</strong>
                      </TableCell>
                      <TableCell align="right">{importResult.students}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Attendance Records Imported:</strong>
                      </TableCell>
                      <TableCell align="right">{importResult.imported}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Records Skipped (duplicates):</strong>
                      </TableCell>
                      <TableCell align="right">{importResult.skipped}</TableCell>
                    </TableRow>
                    {importResult.errors && importResult.errors.length > 0 && (
                      <TableRow>
                        <TableCell>
                          <strong>Errors:</strong>
                        </TableCell>
                        <TableCell align="right">{importResult.errors.length}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {importResult.errors && importResult.errors.length > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Import completed with errors:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
                    {importResult.errors.slice(0, 5).map((err: string, idx: number) => (
                      <Typography component="li" variant="caption" key={idx}>
                        {err}
                      </Typography>
                    ))}
                    {importResult.errors.length > 5 && (
                      <Typography component="li" variant="caption">
                        ... and {importResult.errors.length - 5} more
                      </Typography>
                    )}
                  </Box>
                </Alert>
              )}

              <Button variant="outlined" onClick={handleReset} fullWidth sx={{ mt: 3 }}>
                Import Another File
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
                  <strong>Get CSV from IT:</strong> Request the attendance CSV file from your IT
                  department (generated via Azure runbook)
                </Typography>
                <Typography component="li" variant="body2" paragraph>
                  <strong>Select the file:</strong> Click "Select CSV File" and choose the
                  downloaded CSV
                </Typography>
                <Typography component="li" variant="body2" paragraph>
                  <strong>Import data:</strong> Click "Import Attendance Data" to process the CSV
                </Typography>
                <Typography component="li" variant="body2" paragraph>
                  <strong>View results:</strong> The app will create meetings, students, and
                  attendance records automatically
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card elevation={2} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Expected CSV Format
              </Typography>
              <Typography variant="body2" paragraph>
                The CSV file should contain the following columns:
              </Typography>
              <Box
                component="code"
                sx={{
                  display: 'block',
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  overflowX: 'auto',
                }}
              >
                meeting_id, meeting_title, meeting_start, meeting_end, student_email, student_name,
                join_time, leave_time, duration_minutes
              </Box>
            </CardContent>
          </Card>

          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="info.main">
                Important Notes
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" variant="body2" paragraph>
                  CSV files must be provided by your IT department
                </Typography>
                <Typography component="li" variant="body2" paragraph>
                  Duplicate records (same meeting, student, join time) will be skipped
                </Typography>
                <Typography component="li" variant="body2" paragraph>
                  The import process will automatically create new meetings and students
                </Typography>
                <Typography component="li" variant="body2" paragraph>
                  You can import multiple CSV files to update attendance data
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
