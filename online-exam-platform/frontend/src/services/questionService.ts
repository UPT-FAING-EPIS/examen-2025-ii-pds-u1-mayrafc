import api from './api';
import { Question, CreateQuestionDto } from '../types';

export const questionService = {
  async getQuestionsByExam(examId: number): Promise<Question[]> {
    const response = await api.get<Question[]>(`/questions/exam/${examId}`);
    return response.data;
  },

  async createQuestion(questionDto: CreateQuestionDto): Promise<Question> {
    const response = await api.post<Question>('/questions', questionDto);
    return response.data;
  },

  async updateQuestion(id: number, questionDto: Partial<CreateQuestionDto>): Promise<void> {
    await api.put(`/questions/${id}`, questionDto);
  },

  async deleteQuestion(id: number): Promise<void> {
    await api.delete(`/questions/${id}`);
  }
};