import React from 'react';
import { Box, Paper, Typography, Button, Container, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SupervisorAccount, Engineering } from '@mui/icons-material';

const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (role: 'admin' | 'operator') => {
        login(role);
        navigate('/');
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        borderRadius: 2
                    }}
                >
                    <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
                        PCX Pilot System
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Select your role to access the system
                    </Typography>

                    <Stack spacing={3} width="100%">
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={() => handleLogin('operator')}
                            startIcon={<Engineering sx={{ fontSize: 40 }} />}
                            color="success"
                            sx={{
                                py: 2,
                                justifyContent: 'flex-start',
                                px: 4,
                                textTransform: 'none',
                                fontSize: '1.1rem'
                            }}
                        >
                            <Box sx={{ ml: 2, textAlign: 'left' }}>
                                <Typography variant="h6" fontWeight="bold">Log in as Operator</Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Record measurements, capture evidence
                                </Typography>
                            </Box>
                        </Button>

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={() => handleLogin('admin')}
                            startIcon={<SupervisorAccount sx={{ fontSize: 40 }} />}
                            color="primary"
                            sx={{
                                py: 2,
                                justifyContent: 'flex-start',
                                px: 4,
                                textTransform: 'none',
                                fontSize: '1.1rem'
                            }}
                        >
                            <Box sx={{ ml: 2, textAlign: 'left' }}>
                                <Typography variant="h6" fontWeight="bold">Log in as Supervisor</Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Manage batches, view reports, admin
                                </Typography>
                            </Box>
                        </Button>
                    </Stack>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;
