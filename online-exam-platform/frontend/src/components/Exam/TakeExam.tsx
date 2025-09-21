// frontend/src/components/Exam/TakeExam.tsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { examService } from '../../services/examService';
import { submissionService } from '../../services/submissionService';
import { ExamDetail, ExamSubmission, QuestionType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export const TakeExam: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [submission, setSubmission] = useState<ExamSubmission | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: number]: any }>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitDialog, setSubmitDialog] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (id) {
      loadExamAndStart(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    if (submission && exam && exam.timeLimit > 0) {
      const startTime = new Date(submission.startedAt).getTime();
      const endTime = startTime + (exam.timeLimit * 60 * 1000);
      
      const timer = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          handleSubmitExam();
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [submission, exam]);

  const loadExamAndStart = async (examId: number) => {
    try {
      setLoading(true);
      const examData = await examService.getExam(examId);
      setExam(examData);

      const submissionData = await submissionService.startExam({ examId });
      setSubmission(submissionData);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to start exam');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = async (questionId: number, value: any, isText: boolean = false) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (submission) {
      try {
        await submissionService.submitAnswer(submission.id, {
          questionId,
          selectedOptionId: isText ? undefined : value,
          textAnswer: isText ? value : undefined
        });
      } catch (err: any) {
        console.error('Failed to save answer:', err);
      }
    }
  };

  const handleSubmitExam = async () => {
    if (submission) {
      try {
        await submissionService.submitExam(submission.id);
        navigate('/results');
      } catch (err: any) {
        setError(err.response?.data || 'Failed to submit exam');
      }
    }
  };

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Loading exam...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!exam || !submission) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Exam not found</Alert>
      </Container>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {exam.title}
        </Typography>
        {exam.timeLimit > 0 && (
          <Typography variant="h6" color={timeRemaining < 300000 ? 'error' : 'text.secondary'}>
            Time remaining: {formatTime(timeRemaining)}
          </Typography>
        )}
        <LinearProgress variant="determinate" value={progress} sx={{ mt: 2 }} />
        <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
          Question {currentQuestionIndex + 1} of {exam.questions.length}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {currentQuestion.text}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
            Points: {currentQuestion.points}
          </Typography>

          {currentQuestion.type === QuestionType.MultipleChoice && (
            <FormControl component="fieldset">
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, parseInt(e.target.value))}
              >
                {currentQuestion.options.map((option) => (
                  <FormControlLabel
                    key={option.id}
                    value={option.id}
                    control={<Radio />}
                    label={option.text}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {currentQuestion.type === QuestionType.TrueFalse && (
            <FormControl component="fieldset">
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, parseInt(e.target.value))}
              >
                {currentQuestion.options.map((option) => (
                  <FormControlLabel
                    key={option.id}
                    value={option.id}
                    control={<Radio />}
                    label={option.text}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {currentQuestion.type === QuestionType.OpenEnded && (
            <TextField
              fullWidth
              multiline
              rows={4}
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value, true)}
              placeholder="Enter your answer here..."
            />
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {currentQuestionIndex < exam.questions.length - 1 ? (
            <Button
              variant="contained"
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              onClick={() => setSubmitDialog(true)}
            >
              Submit Exam
            </Button>
          )}
        </Box>
      </Box>

      <Dialog open={submitDialog} onClose={() => setSubmitDialog(false)}>
        <DialogTitle>Submit Exam</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit your exam? You cannot change your answers after submission.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitExam} color="primary" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
