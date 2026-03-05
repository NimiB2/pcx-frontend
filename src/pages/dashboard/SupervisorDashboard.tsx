/**
 * SupervisorDashboard — high-level control tower for supervisors and admins.
 *
 * Accessible to `super_admin` (typically). Shows:
 * - KPI stat cards: active batches, batches at risk, overdue, daily measurements,
 *   critical discrepancies, certification readiness score, End-of-Day status, and credits summary.
 * - Live Production Pipeline (horizontal Kanban of batch stages).
 * - ActionCenter tabbed panel (alerts, reviews, expiring docs).
 * - Gamification section: supervisor's own standing + top 3 operator leaderboard.
 * - Weekly mass balance bar chart and reconciliation/readiness task feeds.
 */
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
    Science,
    EmojiEvents
} from '@mui/icons-material';
import { Avatar, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { mockLeaderboard } from '../../mockData';
import { getPersonalTip } from '../../utils/leaderboardService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatusBadge, { StatusType } from '../../components/common/StatusBadge';
import ProductionPipeline from '../../components/dashboard/ProductionPipeline';
import SystemAlertBanner from '../../components/dashboard/SystemAlertBanner';
import ActionCenter from '../../components/dashboard/ActionCenter';
import { assessCreditsAtRisk } from '../../utils/creditCalculations';
import { BatchRecord } from '../../services/batchService';
import { MeasurementRecord } from '../../services/measurementService';
import { generateEndOfDayReport } from '../../utils/endOfDayService';

// Helper for strict status mapping
const getSeverityStatus = (severity: string): StatusType => {
    if (severity === 'HIGH' || severity === 'BLOCKING') return 'error';
    if (severity === 'MEDIUM' || severity === 'WARNING') return 'warning';
    return 'success';
};

const SupervisorDashboard: React.FC = () => {
    const { batches, discrepancies, punchListTasks, measurements } = useData();

    const activeBatches = batches.filter(b => b.status === 'IN_PROGRESS');
    const overdueBatches = batches.filter(b => b.status === 'OVERDUE_PENDING_APPROVAL');
    const openDiscrepancies = discrepancies.filter(d => d.status === 'OPEN');
    const pendingTasks = punchListTasks.filter(t => t.status !== 'COMPLETED');
    const todayMeasurements = measurements.length;
    // @ts-ignore
    const { creditSummary } = useData();

    const personalEntry = mockLeaderboard.find(d => d.role === 'supervisor' && d.userId === 'SUP-001') || mockLeaderboard.find(d => d.role === 'supervisor');
    const topOperators = mockLeaderboard.filter(d => d.role === 'operator').sort((a, b) => b.totalScore - a.totalScore).slice(0, 3);

    // Calculate batches at risk
    const batchesAtRiskCount = activeBatches.filter(b => {
        const risk = assessCreditsAtRisk(b as any as BatchRecord, measurements, openDiscrepancies);
        return risk.level === 'HIGH' || risk.level === 'MEDIUM';
    }).length;

    // Calculate critical issues count
    const criticalIssues = openDiscrepancies.filter(d => d.severity === 'HIGH').length;

    const eodReport = React.useMemo(() => {
        const targetDate = new Date();
        targetDate.setHours(12, 0, 0, 0);
        return generateEndOfDayReport(batches as any as BatchRecord[], measurements as any as MeasurementRecord[], targetDate);
    }, [batches, measurements]);

    const isEodOverdue = eodReport.requiresSupervisorSignOff && !eodReport.supervisorSignOff && new Date().getHours() >= 18;

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
                    title="Batches at Risk"
                    value={batchesAtRiskCount}
                    subtext="High or Medium risk level"
                    status={batchesAtRiskCount > 0 ? 'error' : 'success'}
                />
                <StatCard
                    title="Overdue Batches"
                    value={overdueBatches.length}
                    subtext="Requires Approval"
                    status={overdueBatches.length > 0 ? 'error' : 'success'}
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

                {/* End-of-Day Status mini-card */}
                <Paper sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    borderLeft: `6px solid ${isEodOverdue ? '#f44336' : (eodReport.requiresSupervisorSignOff ? '#ff9800' : '#4caf50')}`,
                    boxShadow: 2,
                    bgcolor: isEodOverdue ? '#ffebee' : '#f5f5f5'
                }}>
                    <Typography variant="overline" color={isEodOverdue ? 'error' : 'text.secondary'} fontWeight="bold">End-of-Day Status</Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ my: 1, color: isEodOverdue ? 'error.main' : 'text.primary' }}>
                        {eodReport.overallReliabilityScore} Rank
                    </Typography>
                    <Box sx={{ mt: 'auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color={isEodOverdue ? 'error' : 'text.secondary'}>
                            {eodReport.requiresSupervisorSignOff ? "Sign-off Required" : "All Good"}
                        </Typography>
                        <Button
                            component={Link}
                            to="/reports?tab=eod"
                            size="small"
                            variant={isEodOverdue ? "contained" : "outlined"}
                            color={isEodOverdue ? "error" : "primary"}
                            sx={{ mt: 1, textTransform: 'none', px: 1, minWidth: 'max-content' }}
                        >
                            Open Report
                        </Button>
                    </Box>
                </Paper>

                {/* Credits Summary mini-card */}
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', borderLeft: `6px solid ${creditSummary?.flaggedPercentage > 10 ? '#f44336' : '#2196f3'}`, boxShadow: 2, bgcolor: '#f5f5f5' }}>
                    <Typography variant="overline" color="text.secondary" fontWeight="bold">Credits Summary</Typography>
                    <Typography variant="h3" fontWeight="bold" sx={{ my: 1, color: 'text.primary' }}>
                        {creditSummary ? (creditSummary.totalEligibleKg / 1000).toFixed(1) : 0}t
                    </Typography>
                    <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color={creditSummary?.flaggedPercentage > 10 ? 'error' : 'text.secondary'}>
                            {creditSummary?.flaggedPercentage.toFixed(1)}% Flagged
                        </Typography>
                        <Button
                            component={Link}
                            to="/credits/dashboard"
                            size="small"
                            variant="outlined"
                            sx={{ mt: 1, textTransform: 'none', px: 1 }}
                        >
                            View Hub
                        </Button>
                    </Box>
                </Paper>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 4 }}>
                {/* Factory Map */}
                <Box>
                    <ProductionPipeline />
                </Box>

                {/* Quick Actions / Alerts */}
                <ActionCenter />
            </Box>

            {/* Gamification Section */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 2fr' }, gap: 3, mb: 4 }}>
                {/* Personal Standing Card */}
                {personalEntry && (
                    <Card sx={{ bgcolor: '#fff8e1', border: '1px solid #ffe082', boxShadow: 2 }}>
                        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid #ffe082' }}>
                            <EmojiEvents sx={{ color: '#FFD700' }} />
                            <Typography variant="h6" fontWeight="bold">Personal Standing</Typography>
                        </Box>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">Supervisor Leaderboard Rank</Typography>
                                <Typography variant="h3" fontWeight="bold" color="primary.main">
                                    #{personalEntry.rank}
                                </Typography>
                            </Box>
                            <Typography variant="body1" fontWeight="bold" gutterBottom>
                                {personalEntry.totalScore} Points
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                {personalEntry.breakdown.approvalsBonus > 0 && <Chip size="small" label={`Approvals: +${personalEntry.breakdown.approvalsBonus}`} color="primary" variant="outlined" />}
                                {personalEntry.breakdown.slaBonus > 0 && <Chip size="small" label={`SLA: +${personalEntry.breakdown.slaBonus}`} color="secondary" variant="outlined" />}
                                {personalEntry.breakdown.penalties < 0 && <Chip size="small" label={`Penalties: ${personalEntry.breakdown.penalties}`} color="error" />}
                            </Box>
                            <Typography variant="body2" sx={{ bgcolor: 'rgba(255, 215, 0, 0.15)', p: 1.5, borderRadius: 2 }}>
                                <strong>Tip:</strong> {getPersonalTip(personalEntry)}
                            </Typography>
                        </CardContent>
                    </Card>
                )}

                {/* Team Overview Card */}
                <Card sx={{ boxShadow: 2 }}>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
                        <Typography variant="h6" fontWeight="bold">Operator Leaderboard (Top 3)</Typography>
                        <Button component={Link} to="/leaderboard" size="small" endIcon={<ArrowForward />}>
                            Full Leaderboard
                        </Button>
                    </Box>
                    <List sx={{ pt: 0, pb: 0 }}>
                        {topOperators.map((operator, index) => (
                            <ListItem key={operator.userId} divider={index < topOperators.length - 1} sx={{ py: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', width: 40, mr: 1 }}>
                                    {index === 0 ? <EmojiEvents sx={{ color: '#FFD700' }} /> :
                                        index === 1 ? <EmojiEvents sx={{ color: '#C0C0C0' }} /> :
                                            index === 2 ? <EmojiEvents sx={{ color: '#CD7F32' }} /> :
                                                <Typography fontWeight="bold" color="text.secondary">#{operator.rank}</Typography>}
                                </Box>
                                <Avatar sx={{ width: 40, height: 40, mr: 2, bgcolor: 'primary.light' }}>{operator.userName.charAt(0)}</Avatar>
                                <ListItemText
                                    primary={<Typography fontWeight="bold">{operator.userName}</Typography>}
                                    secondary={`${operator.stats?.entriesCount || 0} entries / ${operator.stats?.validatedCount || 0} validated`}
                                />
                                <Typography variant="h6" fontWeight="bold" color="primary.main">{operator.totalScore}</Typography>
                            </ListItem>
                        ))}
                    </List>
                </Card>
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
