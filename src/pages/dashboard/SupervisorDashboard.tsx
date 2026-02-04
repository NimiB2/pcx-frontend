import React from 'react';
import {
    Paper,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    Box,
    Divider,
    Chip
} from '@mui/material';
import {
    TrendingUp,
    Warning,
    CheckCircle,
    Add,
    ArrowForward,
    Speed,
    Science
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatusBadge, { StatusType } from '../../components/common/StatusBadge';
import ProductionPipeline from '../../components/dashboard/ProductionPipeline';
import SystemAlertBanner from '../../components/dashboard/SystemAlertBanner';
import ActionCenter from '../../components/dashboard/ActionCenter';

// Helper for strict status mapping
const getSeverityStatus = (severity: string): StatusType => {
    if (severity === 'HIGH' || severity === 'BLOCKING') return 'error';
    if (severity === 'MEDIUM' || severity === 'WARNING') return 'warning';
    return 'success';
};

const SupervisorDashboard: React.FC = () => {
    const { batches, discrepancies, punchListTasks, measurements } = useData();

    const activeBatches = batches.filter(b => b.status === 'IN_PROGRESS');
    const openDiscrepancies = discrepancies.filter(d => d.status === 'OPEN');
    const pendingTasks = punchListTasks.filter(t => t.status !== 'COMPLETED');
    const todayMeasurements = measurements.length;

    // Calculate critical issues count
    const criticalIssues = openDiscrepancies.filter(d => d.severity === 'HIGH').length;

    const productionData = [
        { name: 'Mon', recycled: 650, virgin: 300 },
        { name: 'Tue', recycled: 720, virgin: 280 },
        { name: 'Wed', recycled: 680, virgin: 320 },
        { name: 'Thu', recycled: 750, virgin: 250 },
        { name: 'Fri', recycled: 800, virgin: 200 },
    ];

    const certificationReadiness = 78;

    const StatCard = ({ title, value, subtext, status = 'default' }: { title: string, value: string | number, subtext: string, status?: 'error' | 'warning' | 'success' | 'default' }) => (
        <Paper sx={{ p: 2, borderLeft: `6px solid`, borderColor: `${status}.main`, boxShadow: 2 }}>
            <Typography variant="overline" color="text.secondary" fontWeight="bold">{title}</Typography>
            <Typography variant="h3" fontWeight="bold" sx={{ my: 1, color: 'text.primary' }}>{value}</Typography>
            <Typography variant="body2" color="text.secondary">{subtext}</Typography>
        </Paper>
    );

    return (
        <Box sx={{ pb: 8 }}>

            <SystemAlertBanner />

            {/* Premium Header */}
            <Box sx={{
                mb: 4,
                p: 3,
                borderRadius: 2,
                bgcolor: '#1a237e',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: 4,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Box sx={{ position: 'absolute', right: 0, bottom: 0, opacity: 0.1 }}>
                    <Speed sx={{ fontSize: 120, transform: 'translate(20px, 20px)' }} />
                </Box>

                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ letterSpacing: 1 }}>
                        CONTROL TOWER
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Chip
                            icon={<CheckCircle sx={{ color: '#4caf50 !important' }} />}
                            label="SYSTEM ONLINE"
                            variant="outlined"
                            sx={{ color: '#81c784', borderColor: '#4caf50', fontWeight: 'bold' }}
                        />
                        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Last Sync: 13:45:02
                        </Typography>
                        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Shift: Morning (A)
                        </Typography>
                    </Box>
                </Box>
                <Button
                    component={Link}
                    to="/measurements/capture"
                    variant="contained"
                    color="secondary"
                    startIcon={<Add />}
                    sx={{ fontWeight: 'bold', boxShadow: 3 }}
                >
                    New Entry
                </Button>
            </Box>

            {/* High Level KPIs */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 4 }}>
                <StatCard
                    title="Active Batches"
                    value={activeBatches.length}
                    subtext="Currently in production"
                    status="success"
                />
                <StatCard
                    title="Daily Measurements"
                    value={todayMeasurements}
                    subtext="Recorded last 24h"
                    status="default"
                />
                <StatCard
                    title="Blocked Discrepancies"
                    value={criticalIssues}
                    subtext="Requires immediate attention"
                    status={criticalIssues > 0 ? 'error' : 'success'}
                />
                <StatCard
                    title="Readiness Score"
                    value={`${certificationReadiness}%`}
                    subtext="Target: 100% by Nov 1"
                    status={certificationReadiness < 80 ? 'warning' : 'success'}
                />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 4 }}>
                {/* Factory Map */}
                <Box>
                    <ProductionPipeline />
                </Box>

                {/* Quick Actions / Alerts */}
                <ActionCenter />
            </Box>

            {/* Mass Balance Chart */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">Weekly Mass Balance</Typography>
                        <Typography variant="body2" color="text.secondary">Input (Recycled/Virgin) Volume Analysis</Typography>
                    </Box>
                    <Button
                        size="small"
                        component={Link}
                        to="/vrcq"
                        variant="outlined"
                        endIcon={<ArrowForward />}
                    >
                        Detailed Report
                    </Button>
                </Box>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={productionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#757575', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#757575', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        />
                        <Legend iconType="circle" />
                        <Bar
                            dataKey="recycled"
                            fill="#4caf50"
                            name="Recycled Input"
                            radius={[4, 4, 0, 0]}
                            barSize={40}
                        />
                        <Bar
                            dataKey="virgin"
                            fill="#90a4ae"
                            name="Virgin Additive"
                            radius={[4, 4, 0, 0]}
                            barSize={40}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </Paper>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                {/* Recent Activity (Discrepancies) */}
                <Paper sx={{ p: 0 }}>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
                        <Typography variant="h6" fontWeight="bold">Reconciliation Feed</Typography>
                        <Button component={Link} to="/reconciliation" size="small" endIcon={<ArrowForward />}>
                            Console
                        </Button>
                    </Box>
                    <List>
                        {openDiscrepancies.slice(0, 3).map((disc) => (
                            <ListItem key={disc.id} divider>
                                <ListItemText
                                    primary={disc.description}
                                    secondary={`Batch: ${disc.batchId}`}
                                />
                                <StatusBadge status={getSeverityStatus(disc.severity)} label={disc.severity} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>

                {/* Readiness Tasks */}
                <Paper sx={{ p: 0 }}>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
                        <Typography variant="h6" fontWeight="bold">Readiness Tasks</Typography>
                        <Button component={Link} to="/punchlist" size="small" endIcon={<ArrowForward />}>
                            Tracker
                        </Button>
                    </Box>
                    <List>
                        {pendingTasks.slice(0, 3).map((task) => (
                            <ListItem key={task.id} divider>
                                <ListItemText
                                    primary={task.title}
                                    secondary={`Due: ${task.dueDate.toLocaleDateString()}`}
                                />
                                <StatusBadge
                                    status={task.priority === 'HIGH' ? 'error' : task.priority === 'MEDIUM' ? 'warning' : 'default'}
                                    label={task.priority}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Box>
        </Box >
    );
};

export default SupervisorDashboard;
