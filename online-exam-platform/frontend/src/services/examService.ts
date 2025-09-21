import api from './api';
import { Exam, ExamDetail, CreateExamDto, Question, CreateQuestionDto } from '../types';

export const examService = {
  async getExams(): Promise<Exam[]> {
    const response = await api.get<Exam[]>('/exams');
    return response.data;
  },

  async getExam(id: number): Promise<ExamDetail> {
    const response = await api.get<ExamDetail>(`/exams/${id}`);
    return response.data;
  },

  async createExam(examDto: CreateExamDto): Promise<Exam> {
    const response = await api.post<Exam>('/exams', examDto);
    return response.data;
  },

  async updateExam(id: number, examDto: Partial<CreateExamDto>): Promise<void> {
    await api.put(`/exams/${id}`, examDto);
  },

  async deleteExam(id: number): Promise<void> {
    await api.delete(`/exams/${id}`);
  },

  async assignExam(examId: number, studentIds: number[], dueDate?: string): Promise<void> {
    await api.post(`/exams/${examId}/assign`, { studentIds, dueDate });
  }
};
