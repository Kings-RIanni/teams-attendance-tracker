import axios, { AxiosInstance } from 'axios';
import {
  Student,
  Meeting,
  AttendanceRecord,
  ApiResponse,
  MeetingAttendanceSummary,
  StudentAttendanceSummary,
  SyncRequest,
} from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Students
  async getStudents(): Promise<Student[]> {
    const response = await this.client.get<ApiResponse<Student[]>>('/students');
    return response.data.data;
  }

  async getStudent(id: string): Promise<Student> {
    const response = await this.client.get<ApiResponse<Student>>(`/students/${id}`);
    return response.data.data;
  }

  async createStudent(student: Partial<Student>): Promise<Student> {
    const response = await this.client.post<ApiResponse<Student>>('/students', student);
    return response.data.data;
  }

  async updateStudent(id: string, student: Partial<Student>): Promise<Student> {
    const response = await this.client.put<ApiResponse<Student>>(`/students/${id}`, student);
    return response.data.data;
  }

  async deleteStudent(id: string): Promise<void> {
    await this.client.delete(`/students/${id}`);
  }

  async searchStudents(query: string): Promise<Student[]> {
    const response = await this.client.get<ApiResponse<Student[]>>('/students/search', {
      params: { q: query },
    });
    return response.data.data;
  }

  async getStudentAttendance(id: string): Promise<StudentAttendanceSummary> {
    const response = await this.client.get<ApiResponse<StudentAttendanceSummary>>(
      `/students/${id}/attendance`
    );
    return response.data.data;
  }

  // Meetings
  async getMeetings(limit = 50, offset = 0): Promise<Meeting[]> {
    const response = await this.client.get<ApiResponse<Meeting[]>>('/meetings', {
      params: { limit, offset },
    });
    return response.data.data;
  }

  async getMeeting(id: string): Promise<Meeting> {
    const response = await this.client.get<ApiResponse<Meeting>>(`/meetings/${id}`);
    return response.data.data;
  }

  async getUpcomingMeetings(limit = 10): Promise<Meeting[]> {
    const response = await this.client.get<ApiResponse<Meeting[]>>('/meetings/upcoming', {
      params: { limit },
    });
    return response.data.data;
  }

  async getRecentMeetings(limit = 10): Promise<Meeting[]> {
    const response = await this.client.get<ApiResponse<Meeting[]>>('/meetings/recent', {
      params: { limit },
    });
    return response.data.data;
  }

  async getMeetingsByDateRange(startDate: string, endDate: string): Promise<Meeting[]> {
    const response = await this.client.get<ApiResponse<Meeting[]>>('/meetings/date-range', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data.data;
  }

  async getMeetingAttendance(id: string): Promise<MeetingAttendanceSummary> {
    const response = await this.client.get<ApiResponse<MeetingAttendanceSummary>>(
      `/meetings/${id}/attendance`
    );
    return response.data.data;
  }

  async syncMeetingAttendance(id: string, userId: string): Promise<void> {
    await this.client.post(`/meetings/${id}/sync`, { user_id: userId });
  }

  // Attendance
  async getAttendanceRecords(limit = 100, offset = 0): Promise<AttendanceRecord[]> {
    const response = await this.client.get<ApiResponse<AttendanceRecord[]>>('/attendance', {
      params: { limit, offset },
    });
    return response.data.data;
  }

  async getAttendanceReport(filters: {
    student_id?: string;
    meeting_id?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
  }): Promise<AttendanceRecord[]> {
    const response = await this.client.get<ApiResponse<AttendanceRecord[]>>('/attendance/report', {
      params: filters,
    });
    return response.data.data;
  }

  async syncRecentAttendance(request: SyncRequest): Promise<void> {
    await this.client.post('/attendance/sync', request);
  }

  async exportAttendanceCSV(filters: {
    student_id?: string;
    meeting_id?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
  }): Promise<Blob> {
    const response = await this.client.get('/attendance/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  }

  // Auth
  async getAuthUrl(): Promise<string> {
    const response = await axios.get<ApiResponse<{ authUrl: string }>>(
      'http://localhost:3001/auth/login'
    );
    return response.data.data.authUrl;
  }
}

export const apiService = new ApiService();
