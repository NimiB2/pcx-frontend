import React from 'react';
import { Box, Paper, Typography, Button, Container, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useAudit } from '../contexts/AuditContext';
import {
    Engineering,
    SupervisorAccount,
    AdminPanelSettings,
    Gavel,
} from '@mui/icons-material';
import { UserRole } from '../utils/permissions';

/**
 * Login Page — Mock Role Selection
 * 
 * Presents 4 role options matching PRD §3 personas.
 * In production this will be replaced with email/password + MFA authentication.
 * 
 * Source: Gap Analysis §B1, User Flows §2.1
 */

interface RoleOption {
    role: UserRole;
    label: string;
    description: string;
    icon: React.ReactElement;
    color: 'success' | 'info' | 'primary' | 'secondary';
}

const ROLE_OPTIONS: RoleOption[] = [
    {
        role: 'field_worker',
        label: 'Field Worker',
        description: 'Record measurements, capture photo evidence, log production events',
        icon: <Engineering sx={{ fontSize: 36 }} />,
        color: 'success',
    },
    {
        role: 'plant_engineer',
        label: 'Plant Engineer',
        description: 'Review VRCQ calculations, manage discrepancies, data validation',
        icon: <SupervisorAccount sx={{ fontSize: 36 }} />,
        color: 'info',
    },
    {
        role: 'super_admin',
        label: 'Super-Admin',
        description: 'Full system management, user administration, configuration',
        icon: <AdminPanelSettings sx={{ fontSize: 36 }} />,
        color: 'primary',
    },
    {
        role: 'regulatory',
        label: 'Regulatory / Commercial',
        description: 'Read-only audit access, review reports, validate compliance',
        icon: <Gavel sx={{ fontSize: 36 }} />,
        color: 'secondary',
    },
];

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { addNotification } = useNotifications();
    const { addLog } = useAudit();

    const handleLogin = (role: UserRole) => {
        login(role);
        addLog('LOGIN_SUCCESS', `User authenticated as ${role}`, role);
        addNotification({
            title: 'Login Successful',
            message: `Welcome back to PCX Control. Logged in as ${role}.`,
            type: 'SUCCESS'
        });
        navigate('/dashboard');
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
                        borderRadius: 2,
                    }}
                >
                    <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
                        PCX Pilot System
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                        Plastic Recycling Certification Platform
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        Select your role to access the system
                    </Typography>

                    <Stack spacing={2} width="100%">
                        {ROLE_OPTIONS.map((option) => (
                            <Button
                                key={option.role}
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={() => handleLogin(option.role)}
                                startIcon={option.icon}
                                color={option.color}
                                aria-label={`Log in as ${option.label}`}
                                sx={{
                                    py: 2,
                                    justifyContent: 'flex-start',
                                    px: 3,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                }}
                            >
                                <Box sx={{ ml: 1.5, textAlign: 'left' }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {option.label}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        {option.description}
                                    </Typography>
                                </Box>
                            </Button>
                        ))}
                    </Stack>

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 3 }}>
                        Mock authentication — production will use Email + Password + MFA
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;
