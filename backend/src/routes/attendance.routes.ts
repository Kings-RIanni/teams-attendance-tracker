import { Router } from 'express';
import {
  getAllAttendanceRecords,
  getAttendanceRecordById,
  createAttendanceRecord,
  updateAttendanceRecord,
  deleteAttendanceRecord,
  getAttendanceReport,
  syncRecentAttendance,
  exportAttendanceCSV,
} from '../controllers/attendance.controller';

const router = Router();

/**
 * @route   GET /api/attendance
 * @desc    Get all attendance records
 * @access  Private
 */
router.get('/', getAllAttendanceRecords);

/**
 * @route   GET /api/attendance/report
 * @desc    Get attendance report with filters
 * @access  Private
 */
router.get('/report', getAttendanceReport);

/**
 * @route   GET /api/attendance/export
 * @desc    Export attendance report as CSV
 * @access  Private
 */
router.get('/export', exportAttendanceCSV);

/**
 * @route   GET /api/attendance/:id
 * @desc    Get attendance record by ID
 * @access  Private
 */
router.get('/:id', getAttendanceRecordById);

/**
 * @route   POST /api/attendance
 * @desc    Create attendance record
 * @access  Private
 */
router.post('/', createAttendanceRecord);

/**
 * @route   POST /api/attendance/sync
 * @desc    Sync recent attendance from Teams
 * @access  Private
 */
router.post('/sync', syncRecentAttendance);

/**
 * @route   PUT /api/attendance/:id
 * @desc    Update attendance record
 * @access  Private
 */
router.put('/:id', updateAttendanceRecord);

/**
 * @route   DELETE /api/attendance/:id
 * @desc    Delete attendance record
 * @access  Private
 */
router.delete('/:id', deleteAttendanceRecord);

export default router;
