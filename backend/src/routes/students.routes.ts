import { Router } from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  searchStudents,
  getStudentAttendance,
} from '../controllers/students.controller';

const router = Router();

/**
 * @route   GET /api/students
 * @desc    Get all students
 * @access  Private
 */
router.get('/', getAllStudents);

/**
 * @route   GET /api/students/search
 * @desc    Search students
 * @access  Private
 */
router.get('/search', searchStudents);

/**
 * @route   GET /api/students/:id
 * @desc    Get student by ID
 * @access  Private
 */
router.get('/:id', getStudentById);

/**
 * @route   GET /api/students/:id/attendance
 * @desc    Get student attendance summary
 * @access  Private
 */
router.get('/:id/attendance', getStudentAttendance);

/**
 * @route   POST /api/students
 * @desc    Create new student
 * @access  Private
 */
router.post('/', createStudent);

/**
 * @route   PUT /api/students/:id
 * @desc    Update student
 * @access  Private
 */
router.put('/:id', updateStudent);

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete student
 * @access  Private
 */
router.delete('/:id', deleteStudent);

export default router;
