import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const getWelcomeMessage = () => {
    switch (user.role) {
      case UserRole.Teacher:
        return 'Welcome to your teaching dashboard';
      case UserRole.Admin:
        return 'Welcome to the admin dashboard';
      default:
        return 'Welcome to your student dashboard';
    }
  };

  const getQuickActions = () => {
    if (user.role === UserRole.Teacher || user.role === UserRole.Admin) {
      return [
        {
          title: 'Create New Exam',
          description: 'Create and configure a new exam for your students',
          action: () => navigate('/create-exam'),
          color: 'primary'
        },
        {
          title: 'My Exams',
          description: 'View and manage your existing exams',
          action: () => navigate('/exams'),
          color: 'secondary'
        }
      ];
    } else {
      return [
        {
          title: 'Available Exams',
          description: 'View exams assigned to you and start taking them',
          action: () => navigate('/exams'),
          color: 'primary'
        },
        {
          title: 'My Results',
          description: 'Check your exam results and performance',
          action: () => navigate('/results'),
          color: 'secondary'
        }
      ];
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Hello, {user.firstName}!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {getWelcomeMessage()}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {getQuickActions().map((action, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color={action.color as any}
                  onClick={action.action}
                  variant="contained"
                >
                  Get Started
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};