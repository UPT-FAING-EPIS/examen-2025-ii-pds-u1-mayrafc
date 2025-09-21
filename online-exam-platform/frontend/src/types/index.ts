export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  isActive: boolean;
  fullName: string;
}

export enum UserRole {
  Student = 1,
  Teacher = 2,
  Admin = 3
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  timeLimit: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showResultsImmediately: boolean;
  creatorName: string;
}

export interface ExamDetail extends Exam {
  questions: Question[];
}

export interface CreateExamDto {
  title: string;
  description: string;
  timeLimit: number;
  startDate: string;
  endDate: string;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showResultsImmediately: boolean;
  questions: CreateQuestionDto[];
}

export interface Question {
  id: number;
  examId: number;
  text: string;
  type: QuestionType;
  order: number;
  points: number;
  isRequired: boolean;
  options: QuestionOption[];
}

export interface CreateQuestionDto {
  examId: number;
  text: string;
  type: QuestionType;
  order: number;
  points: number;
  isRequired: boolean;
  options: CreateQuestionOptionDto[];
}

export enum QuestionType {
  MultipleChoice = 1,
  TrueFalse = 2,
  OpenEnded = 3
}

export interface QuestionOption {
  id: number;
  questionId: number;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface CreateQuestionOptionDto {
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface ExamSubmission {
  id: number;
  examId: number;
  userId: number;
  startedAt: string;
  submittedAt?: string;
  score?: number;
  maxScore?: number;
  status: SubmissionStatus;
  attemptNumber: number;
  examTitle: string;
}

export enum SubmissionStatus {
  InProgress = 1,
  Submitted = 2,
  Graded = 3,
  TimedOut = 4
}

export interface StartExamDto {
  examId: number;
}

export interface SubmitAnswerDto {
  questionId: number;
  selectedOptionId?: number;
  textAnswer?: string;
}

export interface ExamResult {
  id: number;
  examTitle: string;
  submittedAt: string;
  score: number;
  maxScore: number;
  percentage: number;
  attemptNumber: number;
  status: SubmissionStatus;
}