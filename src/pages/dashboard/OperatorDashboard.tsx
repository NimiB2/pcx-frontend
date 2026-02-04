import React from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Card,
    CardContent,
    Stack,
    Chip,
    Divider,
    LinearProgress,
    Fab,
    Tooltip
} from '@mui/material';
import {
    Add,
    CameraAlt,
    History,
    Wifi,
    WifiOff,
    CheckCircle,
    Flag,
    ArrowForward
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { mockBatches, mockMeasurements } from '../../mockData';
import ShiftNotes from '../../components/dashboard/ShiftNotes';
import SystemAlertBanner from '../../components/dashboard/SystemAlertBanner';
import MorningChecklist from '../../components/dashboard/MorningChecklist';

const OperatorDashboard: React.FC = () => {
    // Mock active batch/context
    const activeBatch = mockBatches.find(b => b.status === 'IN_PROGRESS') || mockBatches[0];
    const myRecentActivity = mockMeasurements.slice(0, 3);
    const isOnline = true; // Mock connectivity
    const pendingSync = 0; // Mock sync queue

    // Calculate progress for visual bar
    const progressPercent = Math.min(((activeBatch.currentQuantity || 0) / (activeBatch.targetQuantity || 1)) * 100, 100);

    return (
        <Box sx={{ position: 'relative', pb: 8 }}>
            <SystemAlertBanner />

            {/* Header / Active Context */}
            <Paper sx={{ p: 3, mb: 4, bgcolor: '#e3f2fd', border: '1px solid #90caf9', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, bgcolor: 'primary.main', opacity: 0.1, borderRadius: '50%' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold">
                                CURRENT WORK
                            </Typography>
                            <Chip
                                label={activeBatch.status}
                                color={activeBatch.status === 'IN_PROGRESS' ? 'success' : 'default'}
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                            />
                        </Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom color="primary.main">
                            Mixing Station A
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" fontWeight="medium">
                                {activeBatch.productName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                ({activeBatch.productCode})
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, mb: 1 }}>
                            {isOnline ? <Wifi color="success" /> : <WifiOff color="error" />}
                            <Typography variant="caption" fontWeight="bold">
                                {isOnline ? 'ONLINE' : 'OFFLINE'}
                            </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            Batch: {activeBatch.id}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold">Batch Progress</Typography>
                        <Typography variant="body2">{activeBatch.currentQuantity} / {activeBatch.targetQuantity} kg</Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={progressPercent}
                        sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: 'grey.300',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 5,
                                bgcolor: progressPercent > 90 ? 'success.main' : 'primary.main'
                            }
                        }}
                    />
                </Box>
            </Paper>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>

                {/* Left Column: Actions & Activity */}
                <Box>
                    {/* Primary Actions - Premium Cards */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
                        <Link to="/measurements/capture" style={{ textDecoration: 'none' }}>
                            <Paper
                                elevation={3}
                                sx={{
                                    height: 140, // Increased height
                                    p: 3,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                                    color: 'white',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 8px 20px rgba(76, 175, 80, 0.4)'
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                                        <Add fontSize="large" />
                                    </Box>
                                    <ArrowForward sx={{ opacity: 0.7 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h5" fontWeight="bold">New Weight</Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.9 }}>Record material input</Typography>
                                </Box>
                            </Paper>
                        </Link>

                        <Paper
                            elevation={3}
                            sx={{
                                height: 140, // Increased height
                                p: 3,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                                color: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: '0 8px 20px rgba(2, 136, 209, 0.4)'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                                    <CameraAlt fontSize="large" />
                                </Box>
                                <ArrowForward sx={{ opacity: 0.7 }} />
                            </Box>
                            <Box>
                                <Typography variant="h5" fontWeight="bold">Evidence</Typography>
                                <Typography variant="caption" sx={{ opacity: 0.9 }}>Photo documentation</Typography>
                            </Box>
                        </Paper>
                    </Box>

                    {/* Recent Activity */}
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <History sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="h6" fontWeight="bold">
                                My Recent Activity
                            </Typography>
                        </Box>
                        <Stack spacing={2}>
                            {myRecentActivity.map((log) => (
                                <Card key={log.id} variant="outlined" sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                                    {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {log.station}
                                                </Typography>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {log.value} {log.unit} - {log.materialType}
                                                </Typography>
                                            </Box>
                                            <CheckCircle color="success" fontSize="small" />
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    </Paper>
                </Box>

                {/* Right Column: Shift Notes & Checklist */}
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <MorningChecklist />
                    <ShiftNotes />
                </Box>
            </Box>

            {/* Quick Issue FAB */}
            <Tooltip title="Report Issue">
                <Fab
                    color="error"
                    aria-label="report issue"
                    sx={{ position: 'absolute', bottom: 16, right: 16 }}
                >
                    <Flag />
                </Fab>
            </Tooltip>
        </Box>
    );
};

export default OperatorDashboard;
