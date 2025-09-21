import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { examService } from '../../services/examService';
import { CreateExamDto, QuestionType, CreateQuestionDto, CreateQuestionOptionDto } from '../../types';
import dayjs, { Dayjs } from 'dayjs';

export const CreateExam: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [questionDialog, setQuestionDialog] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    getValues
  } = useForm<CreateExamDto>({
    defaultValues: {
      title: '',
      description: '',
      timeLimit: 60,
      maxAttempts: 1,
      shuffleQuestions: false,
      showResultsImmediately: true,
      questions: []
    }
  });

  const { fields: questions, append: addQuestion, remove: removeQuestion, update: updateQuestion } = useFieldArray({
    control,
    name: 'questions'
  });

  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs().add(1, 'week'));

  const [currentQuestion, setCurrentQuestion] = useState<CreateQuestionDto>({
    examId: 0,
    text: '',
    type: QuestionType.MultipleChoice,
    order: 0,
    points: 1,
    isRequired: true,
    options: []
  });

  const onSubmit = async (data: CreateExamDto) => {
    try {
      setLoading(true);
      setError('');
      
      const examData = {
        ...data,
        startDate: startDate?.toISOString() || new Date().toISOString(),
        endDate: endDate?.toISOString() || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        questions: questions.map((q, index) => ({ ...q, order: index + 1 }))
      };

      await examService.createExam(examData);
      navigate('/exams');
    } catch (err: any) {
      setError(err.response?.data || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setCurrentQuestion({
      examId: 0,
      text: '',
      type: QuestionType.MultipleChoice,
      order: questions.length + 1,
      points: 1,
      isRequired: true,
      options: []
    });
    setEditingQuestionIndex(null);
    setQuestionDialog(true);
  };

  const handleEditQuestion = (index: number) => {
    setCurrentQuestion(questions[index]);
    setEditingQuestionIndex(index);
    setQuestionDialog(true);
  };

  const handleSaveQuestion = () => {
    if (editingQuestionIndex !== null) {
      updateQuestion(editingQuestionIndex, currentQuestion);
    } else {
      addQuestion(currentQuestion);
    }
    setQuestionDialog(false);
    setCurrentQuestion({
      examId: 0,
      text: '',
      type: QuestionType.MultipleChoice,
      order: 0,
      points: 1,
      isRequired: true,
      options: []
    });
  };

  const handleAddOption = () => {
    const newOption: CreateQuestionOptionDto = {
      text: '',
      isCorrect: false,
      order: currentQuestion.options.length + 1
    };
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, newOption]
    });
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions
    });
  };

  const handleOptionChange = (index: number, field: keyof CreateQuestionOptionDto, value: any) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    
    // If setting this option as correct for multiple choice, unset others
    if (field === 'isCorrect' && value && currentQuestion.type !== QuestionType.TrueFalse) {
      newOptions.forEach((opt, i) => {
        if (i !== index) opt.isCorrect = false;
      });
    }
    
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Exam
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Exam Details
                  </Typography>
                  
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Exam Title"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    {...register('title', { required: 'Title is required' })}
                  />
                  
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Description"
                    multiline
                    rows={3}
                    {...register('description')}
                  />

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <DateTimePicker
                        label="Start Date & Time"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            margin: 'normal'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <DateTimePicker
                        label="End Date & Time"
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            margin: 'normal'
                          }
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Time Limit (minutes)"
                        type="number"
                        {...register('timeLimit', { 
                          required: 'Time limit is required',
                          min: { value: 1, message: 'Time limit must be at least 1 minute' }
                        })}
                        error={!!errors.timeLimit}
                        helperText={errors.timeLimit?.message}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Max Attempts"
                        type="number"
                        {...register('maxAttempts', { 
                          required: 'Max attempts is required',
                          min: { value: 1, message: 'Max attempts must be at least 1' }
                        })}
                        error={!!errors.maxAttempts}
                        helperText={errors.maxAttempts?.message}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Questions ({questions.length})
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={handleAddQuestion}
                    >
                      Add Question
                    </Button>
                  </Box>

                  {questions.length === 0 ? (
                    <Alert severity="info">
                      No questions added yet. Click "Add Question" to get started.
                    </Alert>
                  ) : (
                    questions.map((question, index) => (
                      <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle1" gutterBottom>
                                Question {index + 1}: {question.text}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                <Chip 
                                  label={QuestionType[question.type]} 
                                  size="small" 
                                  color="primary" 
                                />
                                <Chip 
                                  label={`${question.points} pts`} 
                                  size="small" 
                                  color="secondary" 
                                />
                              </Box>
                              {question.options.length > 0 && (
                                <Typography variant="body2" color="text.secondary">
                                  Options: {question.options.map(opt => opt.text).join(', ')}
                                </Typography>
                              )}
                            </Box>
                            <Box>
                              <IconButton
                                size="small"
                                onClick={() => handleEditQuestion(index)}
                                color="primary"
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => removeQuestion(index)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Exam Settings
                  </Typography>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Shuffle Questions</InputLabel>
                    <Select
                      label="Shuffle Questions"
                      {...register('shuffleQuestions')}
                    >
                      <MenuItem value="false">No</MenuItem>
                      <MenuItem value="true">Yes</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth margin="normal">
                    <InputLabel>Show Results Immediately</InputLabel>
                    <Select
                      label="Show Results Immediately"
                      {...register('showResultsImmediately')}
                    >
                      <MenuItem value="true">Yes</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </Select>
                  </FormControl>

                  <Box sx={{ mt: 3 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={loading || questions.length === 0}
                    >
                      {loading ? 'Creating Exam...' : 'Create Exam'}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => navigate('/exams')}
                    >
                      Cancel
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>

        {/* Question Dialog */}
        <Dialog
          open={questionDialog}
          onClose={() => setQuestionDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingQuestionIndex !== null ? 'Edit Question' : 'Add Question'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              margin="normal"
              label="Question Text"
              value={currentQuestion.text}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
            />

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Question Type</InputLabel>
                  <Select
                    label="Question Type"
                    value={currentQuestion.type}
                    onChange={(e) => {
                      const newType = e.target.value as QuestionType;
                      let newOptions = [...currentQuestion.options];
                      
                      if (newType === QuestionType.TrueFalse) {
                        newOptions = [
                          { text: 'True', isCorrect: false, order: 1 },
                          { text: 'False', isCorrect: false, order: 2 }
                        ];
                      } else if (newType === QuestionType.OpenEnded) {
                        newOptions = [];
                      }
                      
                      setCurrentQuestion({ 
                        ...currentQuestion, 
                        type: newType,
                        options: newOptions
                      });
                    }}
                  >
                    <MenuItem value={QuestionType.MultipleChoice}>Multiple Choice</MenuItem>
                    <MenuItem value={QuestionType.TrueFalse}>True/False</MenuItem>
                    <MenuItem value={QuestionType.OpenEnded}>Open Ended</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Points"
                  type="number"
                  value={currentQuestion.points}
                  onChange={(e) => setCurrentQuestion({ 
                    ...currentQuestion, 
                    points: parseInt(e.target.value) || 1 
                  })}
                />
              </Grid>
            </Grid>

            {/* Options */}
            {(currentQuestion.type === QuestionType.MultipleChoice || currentQuestion.type === QuestionType.TrueFalse) && (
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">Options</Typography>
                  {currentQuestion.type === QuestionType.MultipleChoice && (
                    <Button
                      size="small"
                      onClick={handleAddOption}
                      startIcon={<Add />}
                    >
                      Add Option
                    </Button>
                  )}
                </Box>

                {currentQuestion.options.map((option, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      label={`Option ${index + 1}`}
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                      disabled={currentQuestion.type === QuestionType.TrueFalse}
                    />
                    <FormControl>
                      <InputLabel>Correct</InputLabel>
                      <Select
                        label="Correct"
                        value={option.isCorrect}
                        onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.value)}
                      >
                        <MenuItem value="false">No</MenuItem>
                        <MenuItem value="true">Yes</MenuItem>
                      </Select>
                    </FormControl>
                    {currentQuestion.type === QuestionType.MultipleChoice && (
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setQuestionDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSaveQuestion}
              variant="contained"
              disabled={!currentQuestion.text.trim()}
            >
              {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};