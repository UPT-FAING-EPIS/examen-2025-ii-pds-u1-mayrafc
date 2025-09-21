import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  LinearProgress
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { submissionService } from '../../services/submissionService';
import { ExamResult, SubmissionStatus } from '../../types';
import { formatDateTime } from '../../utils/dateUtils';

export const ResultsList: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadResults();
    }
  }, [user]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const data = await submissionService.getResults(user!.id);
      setResults(data);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.Graded:
        return 'success';
      case SubmissionStatus.Submitted:
        return 'info';
      case SubmissionStatus.InProgress:
        return 'warning';
      case SubmissionStatus.TimedOut:
        return 'error';
      default:
        return 'default';
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'info';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading results...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Exam Results
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {results.length === 0 ? (
        <Alert severity="info">
          You haven't completed any exams yet.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {results.map((result) => (
            <Grid item xs={12} md={6} lg={4} key={result.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                      {result.examTitle}
                    </Typography>
                    <Chip
                      label={SubmissionStatus[result.status]}
                      color={getStatusColor(result.status) as any}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h4" color={getGradeColor(result.percentage)}>
                      {result.score}/{result.maxScore}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {result.percentage.toFixed(1)}%
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={result.percentage}
                    color={getGradeColor(result.percentage) as any}
                    sx={{ mb: 2 }}
                  />

                  <Box>
                    <Typography variant="caption" display="block">
                      Submitted: {formatDateTime(result.submittedAt)}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Attempt: {result.attemptNumber}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Summary Statistics */}
      {results.length > 0 && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Summary Statistics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" color="primary">
                  {results.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Exams Completed
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" color="success.main">
                  {(results.reduce((acc, r) => acc + r.percentage, 0) / results.length).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Score
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" color="info.main">
                  {Math.max(...results.map(r => r.percentage)).toFixed(1)}%
                </Typography>
                                <Typography variant="body2" color="text.secondary">
                  Highest Score
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" color="error.main">
                  {Math.min(...results.map(r => r.percentage)).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lowest Score
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};
