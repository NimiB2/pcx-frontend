/**
 * CreditsDashboard — overview of PCR credit eligibility, risk, and monthly trends.
 *
 * Accessible by plant_engineer, super_admin, and regulatory (read-only).
 * Displays KPI cards (total eligible kg, completion %, flagged %, projected year-end),
 * a Recharts pie chart (rigidity breakdown) and bar chart (monthly trend),
 * and a per-batch eligibility table driven by `creditCalculations.ts`.
 */
import React, { useMemo } from 'react';

import { Box, Typography, Paper, Card, CardContent, LinearProgress, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useData } from '../contexts/DataContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { aggregateCreditSummary, forecastEligibleKg, calculateCreditEligibleInput } from '../utils/creditCalculations';
import StatusBadge from '../components/common/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { BatchRecord } from '../services/batchService';

const COLORS = ['#4caf50', '#81c784'];

const CreditsDashboard: React.FC = () => {
    const { batches, measurements, creditSummary, monthlyCredits } = useData();
    const navigate = useNavigate();

    const computedSummary = useMemo(() => aggregateCreditSummary(batches as unknown as BatchRecord[], measurements, 50000), [batches, measurements]);
    const summary = (computedSummary.totalEligibleKg > 0 ? computedSummary : creditSummary) as any;

    const forecast = forecastEligibleKg(batches as unknown as BatchRecord[]);
    const projectedKg = forecast.projectedKg > 0 ? forecast.projectedKg : summary.projectedYearEndKg;

    const pieData = [
        { name: 'Rigid', value: summary.totalRigidKg },
        { name: 'Non-Rigid', value: summary.totalNonRigidKg }
    ];

    const completedBatches = batches.filter(b => b.status === 'COMPLETED' || b.status === 'OVERDUE_PENDING_APPROVAL');

    const formatKg = (val: number) => `${(val / 1000).toFixed(1)}t`;

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Credits Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={4}>
                Overview of credit-eligible material, risk allocations, and forecasting.
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
                <Box>
                    <Card sx={{ height: '100%', borderLeft: '6px solid #4caf50' }}>
                        <CardContent>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold">Total Eligible</Typography>
                            <Typography variant="h3" fontWeight="bold" sx={{ my: 1, color: '#4caf50' }}>
                                {formatKg(summary.totalEligibleKg)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">Tonnes</Typography>
                        </CardContent>
                    </Card>
                </Box>
                <Box>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="overline" color="text.secondary" fontWeight="bold">% Completed</Typography>
                                <Typography variant="h5" fontWeight="bold">{summary.completionPercentage.toFixed(1)}%</Typography>
                            </Box>
                            <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, mb: 2 }}>
                                {formatKg(summary.totalEligibleKg)} / {formatKg(summary.annualTargetKg)}
                            </Typography>
                            <LinearProgress variant="determinate" value={Math.min(100, summary.completionPercentage)} color="primary" sx={{ height: 8, borderRadius: 4 }} />
                        </CardContent>
                    </Card>
                </Box>
                <Box>
                    <Card sx={{ height: '100%', borderLeft: `6px solid ${summary.flaggedPercentage > 10 ? '#f44336' : '#ff9800'}` }}>
                        <CardContent>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold">% Flagged (Risk)</Typography>
                            <Typography variant="h3" fontWeight="bold" sx={{ my: 1, color: summary.flaggedPercentage > 10 ? '#f44336' : '#ff9800' }}>
                                {summary.flaggedPercentage.toFixed(1)}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">{formatKg(summary.flaggedKg)} flagged</Typography>
                        </CardContent>
                    </Card>
                </Box>
                <Box>
                    <Card sx={{ height: '100%', borderLeft: '6px solid #2196f3' }}>
                        <CardContent>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold">Projected Year-End</Typography>
                            <Typography variant="h3" fontWeight="bold" sx={{ my: 1, color: '#2196f3' }}>
                                {formatKg(projectedKg)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">Tonnes (Confidence: {forecast.confidenceLevel})</Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3, mb: 4 }}>
                <Box>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" fontWeight="bold" mb={2}>Rigidity Breakdown</Typography>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: any) => [`${Number(value).toFixed(1)} kg`, 'Eligible']} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Box>

                <Box>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" fontWeight="bold" mb={2}>Monthly Trend</Typography>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={monthlyCredits} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val / 1000}t`} />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} formatter={(val: any) => [`${val} kg`, 'Credits']} />
                                <Legend />
                                <Bar dataKey="actual" name="Actual" fill="#4caf50" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="projected" name="Projected" fill="#e0e0e0" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Box>
            </Box>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>Batch-Level Eligible Credits</Typography>
                <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Batch ID</strong></TableCell>
                                <TableCell><strong>Product</strong></TableCell>
                                <TableCell><strong>Eligible kg</strong></TableCell>
                                <TableCell><strong>Rigid kg</strong></TableCell>
                                <TableCell><strong>Non-Rigid kg</strong></TableCell>
                                <TableCell><strong>Risk Status</strong></TableCell>
                                <TableCell><strong>Date</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {completedBatches.map((batch: any) => {
                                const breakdown = calculateCreditEligibleInput(batch as unknown as BatchRecord, measurements);
                                const isAtRisk = batch.status === 'OVERDUE_PENDING_APPROVAL';

                                return (
                                    <TableRow
                                        key={batch.id}
                                        hover
                                        onClick={() => navigate(`/batches/${batch.id}`)}
                                        sx={{
                                            cursor: 'pointer',
                                            backgroundColor: isAtRisk ? 'rgba(244, 67, 54, 0.05)' : 'inherit'
                                        }}
                                    >
                                        <TableCell>{batch.id}</TableCell>
                                        <TableCell>{batch.productName}</TableCell>
                                        <TableCell>{breakdown.totalEligibleKg.toFixed(1)}</TableCell>
                                        <TableCell>{breakdown.rigidKg.toFixed(1)}</TableCell>
                                        <TableCell>{breakdown.nonRigidKg.toFixed(1)}</TableCell>
                                        <TableCell>
                                            {isAtRisk ? (
                                                <StatusBadge status="warning" label="CREDITS_AT_RISK" />
                                            ) : (
                                                <StatusBadge status="success" label="CLEARED" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {batch.completedDate ? new Date(batch.completedDate).toLocaleDateString() : new Date(batch.startDate).toLocaleDateString() + ' (Est)'}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Box>
            </Paper>
        </Box>
    );
};

export default CreditsDashboard;
