import React from 'react';
import {
    Grid,
    Paper,
    Typography,
    Button,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    Chip,
    Box,
} from '@mui/material';
import {
    TrendingUp,
    Warning,
    CheckCircle,
    Add,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import {
    mockMeasurements,
    mockBatches,
    mockDiscrepancies,
    mockPunchListTasks,
} from '../mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const Dashboard: React.FC = () => {
    const activeBatches = mockBatches.filter(b => b.status === 'IN_PROGRESS');
    const openDiscrepancies = mockDiscrepancies.filter(d => d.status === 'OPEN');
    const pendingTasks = mockPunchListTasks.filter(t => t.status !== 'COMPLETED');
    const todayMeasurements = mockMeasurements.length;

    const productionData = [
        { name: 'Mon', recycled: 650, virgin: 300 },
        { name: 'Tue', recycled: 720, virgin: 280 },
        { name: 'Wed', recycled: 680, virgin: 320 },
        { name: 'Thu', recycled: 750, virgin: 250 },
        { name: 'Fri', recycled: 800, virgin: 200 },
    ];

    const certificationReadiness = 78;

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Typography variant="h4" gutterBottom fontWeight="bold">
                        Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Real-time production status and certification readiness
                    </Typography>
                </div>
                <Button
                    component={Link}
                    to="/measurements/capture"
                    variant="contained"
                    startIcon={<Add />}
                    size="large"
                >
                    Capture Measurement
                </Button>
            </Box>

            {/* Stats Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 4 }}>
                <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <Typography variant="h3" fontWeight="bold">{activeBatches.length}</Typography>
                    <Typography variant="body2">Active Batches</Typography>
                </Paper>
                <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', color: 'white' }}>
                    <Typography variant="h3" fontWeight="bold">{todayMeasurements}</Typography>
                    <Typography variant="body2">Measurements Today</Typography>
                </Paper>
                <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
                    <Typography variant="h3" fontWeight="bold">{openDiscrepancies.length}</Typography>
                    <Typography variant="body2">Open Discrepancies</Typography>
                </Paper>
                <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', color: 'white' }}>
                    <Typography variant="h3" fontWeight="bold">{certificationReadiness}%</Typography>
                    <Typography variant="body2">Cert. Readiness</Typography>
                </Paper>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 3 }}>
                {/* Production Chart */}
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                        Weekly Production Overview
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={productionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="recycled" fill="#4caf50" name="Recycled (kg)" />
                            <Bar dataKey="virgin" fill="#9e9e9e" name="Virgin (kg)" />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>

                {/* Certification Readiness */}
                <Paper sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                        Certification Readiness
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3 }}>
                        <Box
                            sx={{
                                width: 150,
                                height: 150,
                                borderRadius: '50%',
                                border: '12px solid',
                                borderColor: certificationReadiness >= 80 ? '#4caf50' : '#ff9800',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2,
                            }}
                        >
                            <Typography variant="h3" fontWeight="bold">
                                {certificationReadiness}%
                            </Typography>
                        </Box>
                        <Chip
                            label={certificationReadiness >= 80 ? 'On Track' : 'Needs Attention'}
                            color={certificationReadiness >= 80 ? 'success' : 'warning'}
                        />
                    </Box>
                </Paper>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                {/* Recent Discrepancies */}
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                            Open Discrepancies
                        </Typography>
                        <Button component={Link} to="/reconciliation" size="small">
                            View All
                        </Button>
                    </Box>
                    <List>
                        {openDiscrepancies.slice(0, 3).map((disc) => (
                            <ListItem key={disc.id} divider>
                                <ListItemText
                                    primary={disc.description}
                                    secondary={`${disc.type} - ${disc.severity}`}
                                />
                                <Chip
                                    label={disc.severity}
                                    size="small"
                                    color={disc.severity === 'HIGH' ? 'error' : 'warning'}
                                />
                            </ListItem>
                        ))}
                        {openDiscrepancies.length === 0 && (
                            <ListItem>
                                <ListItemText
                                    primary="No open discrepancies"
                                    secondary="All reconciliations are up to date"
                                />
                                <CheckCircle color="success" />
                            </ListItem>
                        )}
                    </List>
                </Paper>

                {/* Pending Tasks */}
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                            Pending Punch List Tasks
                        </Typography>
                        <Button component={Link} to="/punchlist" size="small">
                            View All
                        </Button>
                    </Box>
                    <List>
                        {pendingTasks.slice(0, 3).map((task) => (
                            <ListItem key={task.id} divider>
                                <ListItemText
                                    primary={task.title}
                                    secondary={`Due: ${task.dueDate.toLocaleDateString()}`}
                                />
                                <Chip
                                    label={task.priority}
                                    size="small"
                                    color={
                                        task.priority === 'HIGH' ? 'error' :
                                            task.priority === 'MEDIUM' ? 'warning' : 'default'
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Box>
        </Box >
    );
};

export default Dashboard;
