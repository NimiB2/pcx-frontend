import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Tabs,
    Tab,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    ButtonGroup,
    Button
} from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    TrendingFlat,
    EmojiEvents,
    Timer,
    CheckCircle,
    LocationOn
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { mockLeaderboard } from '../mockData';
import { getNormalizedScore, getPersonalTip, LeaderboardEntry } from '../utils/leaderboardService';
import { useTheme } from '@mui/material/styles';

const Leaderboard: React.FC = () => {
    const { user } = useAuth();
    const theme = useTheme();

    const [tabValue, setTabValue] = useState(0);
    const [timePeriod, setTimePeriod] = useState<'WEEK' | 'MONTH' | 'ALL'>('WEEK');

    // Filter based on selected tab (0 = All, 1 = Operators, 2 = Supervisors, 3 = Auditors)
    const filteredData = useMemo(() => {
        let data = [...mockLeaderboard];

        if (tabValue === 1) data = data.filter(d => d.role === 'operator');
        if (tabValue === 2) data = data.filter(d => d.role === 'supervisor');
        if (tabValue === 3) data = data.filter(d => d.role === 'auditor');

        // If 'All' is selected, we need to sort by normalized score for fair comparison
        if (tabValue === 0) {
            data.sort((a, b) => getNormalizedScore(b) - getNormalizedScore(a));
            // Reassign ranks for the mixed view
            data = data.map((d, index) => ({ ...d, mixedRank: index + 1 }));
        } else {
            // Roles are already sorted by rank in their own category in the mock data,
            // but we ensure it's sorted by score just in case.
            data.sort((a, b) => b.totalScore - a.totalScore);
            data = data.map((d, index) => ({ ...d, rank: index + 1 }));
        }

        return data;
    }, [tabValue, mockLeaderboard]);

    const topThree = filteredData.slice(0, 3);
    const restOfList = filteredData.slice(3);

    // Find the logged-in user's entry
    const personalEntry = mockLeaderboard.find(d => d.userId === user?.id || (user?.role === 'operator' && d.role === 'operator' && d.userId === '1')); // the mock has user '1' as logged in operator

    const getRoleLabel = (role: string) => {
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'UP': return <TrendingUp color="success" fontSize="small" />;
            case 'DOWN': return <TrendingDown color="error" fontSize="small" />;
            default: return <TrendingFlat color="action" fontSize="small" />;
        }
    };

    const calculateDisplayScore = (entry: any) => {
        // In "All" tab, show normalized score out of 100
        if (tabValue === 0) {
            return `${getNormalizedScore(entry)} / 100`;
        }
        return entry.totalScore;
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">
                    Factory Leaderboard
                </Typography>

                <ButtonGroup variant="outlined" size="small">
                    <Button
                        variant={timePeriod === 'WEEK' ? 'contained' : 'outlined'}
                        onClick={() => setTimePeriod('WEEK')}
                    >
                        This Week
                    </Button>
                    <Button
                        variant={timePeriod === 'MONTH' ? 'contained' : 'outlined'}
                        onClick={() => setTimePeriod('MONTH')}
                    >
                        This Month
                    </Button>
                    <Button
                        variant={timePeriod === 'ALL' ? 'contained' : 'outlined'}
                        onClick={() => setTimePeriod('ALL')}
                    >
                        All Time
                    </Button>
                </ButtonGroup>
            </Box>

            {/* Personal Stats Card */}
            {personalEntry && (
                <Card sx={{ mb: 4, background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`, color: 'white' }}>
                    <CardContent>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '4fr 5fr 3fr' }, gap: 3, alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6" gutterBottom>Your Standing ({timePeriod})</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                    <Typography variant="h3" fontWeight="bold">#{personalEntry.rank}</Typography>
                                    <Typography variant="subtitle1">of {mockLeaderboard.filter(d => d.role === personalEntry.role).length} {personalEntry.role}s</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                                    Score: <strong>{personalEntry.totalScore} pts</strong>
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>Score Breakdown</Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip size="small" label={`Base: ${personalEntry.breakdown.basePoints}`} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                                    {personalEntry.breakdown.accuracyBonus > 0 && <Chip size="small" label={`Accuracy: +${personalEntry.breakdown.accuracyBonus}`} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />}
                                    {personalEntry.breakdown.speedBonus > 0 && <Chip size="small" label={`Speed: +${personalEntry.breakdown.speedBonus}`} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />}
                                    {personalEntry.breakdown.gpsBonus > 0 && <Chip size="small" label={`GPS: +${personalEntry.breakdown.gpsBonus}`} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />}
                                    {personalEntry.breakdown.approvalsBonus > 0 && <Chip size="small" label={`Approvals: +${personalEntry.breakdown.approvalsBonus}`} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />}
                                    {personalEntry.breakdown.slaBonus > 0 && <Chip size="small" label={`SLA: +${personalEntry.breakdown.slaBonus}`} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />}
                                    {personalEntry.breakdown.penalties < 0 && <Chip size="small" label={`Penalties: ${personalEntry.breakdown.penalties}`} color="error" />}
                                </Box>
                            </Box>
                            <Box>
                                <Box sx={{ bgcolor: 'rgba(0,0,0,0.1)', p: 2, borderRadius: 2 }}>
                                    <Typography variant="caption" fontWeight="bold" sx={{ display: 'block', mb: 1, color: '#e0e0e0' }}>PRO TIP</Typography>
                                    <Typography variant="body2">{getPersonalTip(personalEntry)}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Role Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(_, nv) => setTabValue(nv)} aria-label="leaderboard roles">
                    <Tab label="All Roles (Normalized)" />
                    <Tab label="Operators" />
                    <Tab label="Supervisors" />
                    <Tab label="Auditors" />
                </Tabs>
            </Box>

            {/* Podium Section */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 4, mb: 6, mt: 4 }}>
                {/* 2nd Place */}
                {topThree[1] && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar sx={{ width: 64, height: 64, mb: 1, bgcolor: '#C0C0C0', border: '3px solid #C0C0C0', color: '#000' }}>
                            {topThree[1].userName.charAt(0)}
                        </Avatar>
                        <Box sx={{ bgcolor: '#f5f5f5', p: 2, pb: 4, borderRadius: '8px 8px 0 0', width: 120, textAlign: 'center', borderTop: '4px solid #C0C0C0' }}>
                            <Typography variant="h5" fontWeight="bold" color="textSecondary">2</Typography>
                            <Typography variant="body2" fontWeight="bold" noWrap sx={{ mt: 1 }}>{topThree[1].userName}</Typography>
                            <Typography variant="caption" color="textSecondary">{calculateDisplayScore(topThree[1])} pts</Typography>
                        </Box>
                    </Box>
                )}

                {/* 1st Place */}
                {topThree[0] && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <EmojiEvents sx={{ color: '#FFD700', fontSize: 40, mb: 1 }} />
                        <Avatar sx={{ width: 80, height: 80, mb: 1, bgcolor: '#FFD700', border: '4px solid #FFD700', color: '#000' }}>
                            {topThree[0].userName.charAt(0)}
                        </Avatar>
                        <Box sx={{ bgcolor: '#fff8e1', p: 2, pb: 6, borderRadius: '8px 8px 0 0', width: 140, textAlign: 'center', borderTop: '4px solid #FFD700', boxShadow: '0 -4px 10px rgba(0,0,0,0.05)' }}>
                            <Typography variant="h4" fontWeight="bold" color="textPrimary">1</Typography>
                            <Typography variant="body1" fontWeight="bold" noWrap sx={{ mt: 1 }}>{topThree[0].userName}</Typography>
                            <Typography variant="body2" color="primary" fontWeight="bold">{calculateDisplayScore(topThree[0])} pts</Typography>
                        </Box>
                    </Box>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar sx={{ width: 64, height: 64, mb: 1, bgcolor: '#CD7F32', border: '3px solid #CD7F32', color: '#fff' }}>
                            {topThree[2].userName.charAt(0)}
                        </Avatar>
                        <Box sx={{ bgcolor: '#f5f5f5', p: 2, pb: 2, borderRadius: '8px 8px 0 0', width: 120, textAlign: 'center', borderTop: '4px solid #CD7F32' }}>
                            <Typography variant="h6" fontWeight="bold" color="textSecondary">3</Typography>
                            <Typography variant="body2" fontWeight="bold" noWrap sx={{ mt: 1 }}>{topThree[2].userName}</Typography>
                            <Typography variant="caption" color="textSecondary">{calculateDisplayScore(topThree[2])} pts</Typography>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* List Section */}
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>
                            {tabValue === 0 && <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>}
                            <TableCell sx={{ fontWeight: 'bold' }}>Score</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Trend</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Primary Metric</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {restOfList.map((row: any) => {
                            const isCurrentUser = row.userId === user?.id || (user?.role === 'operator' && row.role === 'operator' && row.userId === '1');
                            const displayRank = tabValue === 0 ? row.mixedRank : row.rank;

                            return (
                                <TableRow
                                    key={row.userId}
                                    sx={{
                                        bgcolor: isCurrentUser ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                                        '&:last-child td, &:last-child th': { border: 0 }
                                    }}
                                >
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight="bold" color="textSecondary">
                                            #{displayRank}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>{row.userName.charAt(0)}</Avatar>
                                            <Typography variant="body2" fontWeight={isCurrentUser ? "bold" : "normal"}>
                                                {row.userName} {isCurrentUser && '(You)'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    {tabValue === 0 && (
                                        <TableCell>
                                            <Chip size="small" label={getRoleLabel(row.role)} variant="outlined" />
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold">
                                            {calculateDisplayScore(row)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{getTrendIcon(row.weeklyTrend)}</TableCell>
                                    <TableCell>
                                        {row.role === 'operator' && (
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: '0.8rem' }}>
                                                    <CheckCircle fontSize="small" color="success" />
                                                    {row.stats.validatedCount}/{row.stats.entriesCount} Validated
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: '0.8rem' }}>
                                                    <LocationOn fontSize="small" color="primary" />
                                                    {row.stats.gpsVerifiedCount} GPS
                                                </Box>
                                            </Box>
                                        )}
                                        {row.role === 'supervisor' && (
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: '0.8rem' }}>
                                                    <Timer fontSize="small" color="success" />
                                                    {row.stats.approvalsOnTime} Approvals on Time
                                                </Box>
                                            </Box>
                                        )}
                                        {row.role === 'auditor' && (
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: '0.8rem' }}>
                                                    <CheckCircle fontSize="small" color="success" />
                                                    {row.stats.signoffs} Sign-offs
                                                </Box>
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        {restOfList.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body2" color="textSecondary">
                                        Showing top 3 above. No other entries found.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Leaderboard;
