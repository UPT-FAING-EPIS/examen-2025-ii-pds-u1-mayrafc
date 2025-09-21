import api from './api';
import { ExamSubmission, StartExamDto, SubmitAnswerDto, ExamResult } from '../types';

export const submissionService = {
  async startExam(startExamDto: StartExamDto): Promise<ExamSubmission> {
    const response = await api.post<ExamSubmission>('/submissions', startExamDto);
    return response.data;
  },

  async submitAnswer(submissionId: number, answerDto: SubmitAnswerDto): Promise<void> {
    await api.post(`/submissions/${submissionId}/answers`, answerDto);
  },

  async submitExam(submissionId: number): Promise<void> {
    await api.post(`/submissions/${submissionId}/submit`);
  },

  async getResults(userId: number): Promise<ExamResult[]> {
    const response = await api.get<ExamResult[]>(`/submissions/results/${userId}`);
    return response.data;
  }
};