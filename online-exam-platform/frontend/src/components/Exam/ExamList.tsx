import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useAuth } from '../../contexts/AuthContext';
import { examService } from '../../services/examService';
import { Exam, UserRole } from '../../types';
import { useNavigate } from 'react-router-dom';
import { formatDateTime, getRemainingTime, isDateInPast } from '../../utils/dateUtils';

export const ExamList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await examService.getExams();
      setExams(data);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = (examId: number) => {
    navigate(`/take-exam/${examId}`);
  };

  const handleViewExam = (examId: number) => {
    navigate(`/exam/${examId}`);
  };

  const handleEditExam = (examId: number) => {
    navigate(`/edit-exam/${examId}`);
  };

  const getExamStatus = (exam: Exam) => {
    const now = new Date();
    const start = new Date(exam.startDate);
    const end = new Date(exam.endDate);

    if (!exam.isActive) return { label: 'Inactive', color: 'default' as const };
    if (now < start) return { label: 'Upcoming', color: 'info' as const };
    if (now > end) return { label: 'Expired', color: 'error' as const };
    return { label: 'Active', color: 'success' as const };
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading exams...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {user?.role === UserRole.Student ? 'Available Exams' : 'My Exams'}
        </Typography>
        {(user?.role === UserRole.Teacher || user?.role === UserRole.Admin) && (
          <Button
            variant="contained"
            onClick={() => navigate('/create-exam')}
          >
            Create New Exam
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {exams.length === 0 ? (
        <Alert severity="info">
          {user?.role === UserRole.Student 
            ? 'No exams have been assigned to you yet.' 
            : 'You haven\'t created any exams yet.'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {exams.map((exam) => {
            const status = getExamStatus(exam);
            const isExpired = isDateInPast(exam.endDate);
            
            return (
              <Grid item xs={12} md={6} lg={4} key={exam.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                        {exam.title}
                      </Typography>
                      <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {exam.description}
                    </Typography>

                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" display="block">
                        Duration: {exam.timeLimit} minutes
                      </Typography>
                      <Typography variant="caption" display="block">
                        Start: {formatDateTime(exam.startDate)}
                      </Typography>
                      <Typography variant="caption" display="block">
                        End: {formatDateTime(exam.endDate)}
                      </Typography>
                      {!isExpired && (
                        <Typography variant="caption" display="block" color="primary">
                          Time remaining: {getRemainingTime(exam.endDate)}
                        </Typography>
                      )}
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      Created by: {exam.creatorName}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    {user?.role === UserRole.Student ? (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleStartExam(exam.id)}
                        disabled={!exam.isActive || isExpired}
                      >
                        {isExpired ? 'Expired' : 'Start Exam'}
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="small"
                          onClick={() => handleViewExam(exam.id)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleEditExam(exam.id)}
                        >
                          Edit
                        </Button>
                      </>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};