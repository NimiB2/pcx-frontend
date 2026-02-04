import React, { useState } from 'react';
import { Box, Typography, Paper, LinearProgress, List, ListItem, ListItemButton, ListItemText, ListItemIcon, Button, Chip, Divider, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    CheckCircle as DoneIcon,
    RadioButtonUnchecked as TodoIcon,
    Warning as AlertIcon,
    Block as BlockingIcon,
    Event as DateIcon
} from '@mui/icons-material';
import EvidenceLink from '../components/common/EvidenceLink';
import { useData } from '../contexts/DataContext';

interface Task {
    id: string;
    title: string;
    expiryDate: string;
    status: 'completed' | 'pending';
    criticality: 'blocking' | 'warning' | 'info';
}

const PunchList: React.FC = () => {
    const theme = useTheme();
    const { punchListTasks, updateTaskStatus } = useData();

    // Map context tasks to component format (if types differ, otherwise just use directly)
    // Here we can use punchListTasks directly as they match the interface generally

    const completedCount = punchListTasks.filter(t => t.status === 'COMPLETED').length;
    const progress = (completedCount / punchListTasks.length) * 100;

    const handleToggleTask = (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
        updateTaskStatus(id, newStatus);
    };

    const getExpiryStatus = (dateStr: string, status: string) => {
        if (status === 'completed') return { label: 'VALID', color: theme.palette.success.main };

        const today = new Date('2023-10-25'); // Mock "Today"
        const expiry = new Date(dateStr);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: 'EXPIRED (BLOCKING)', color: theme.palette.error.main, icon: <BlockingIcon color="error" /> };
        if (diffDays < 7) return { label: `EXPIRING IN ${diffDays} DAYS`, color: theme.palette.warning.main, icon: <AlertIcon color="warning" /> };

        return { label: `Due: ${dateStr}`, color: theme.palette.text.secondary };
    };

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', items: 'center' }}>
                <Box>
                    <Typography variant="h4" gutterBottom>Certification Readiness</Typography>
                    <Typography variant="subtitle1" color="text.secondary">Project: PCX-PILOT-2023-Q4</Typography>
                </Box>
                <Button variant="contained" color="primary" disabled={progress < 100}>
                    Request Final Audit
                </Button>
            </Box>

            <Grid container spacing={4}>
                {/* Progress Overview */}
                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 3, mb: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography fontWeight="bold">Readiness Score</Typography>
                                <Typography fontWeight="bold">{progress.toFixed(0)}%</Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{ height: 10, borderRadius: 5, bgcolor: theme.palette.grey[200] }}
                                color={progress === 100 ? 'success' : 'primary'}
                            />
                        </Box>
                        <Chip label={progress === 100 ? "READY" : "NOT READY"} color={progress === 100 ? "success" : "default"} />
                    </Paper>
                </Grid>

                {/* Task List */}
                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ borderRadius: 0 }}>
                        <List>
                            {punchListTasks.map((task, index) => {
                                const expiryInfo = getExpiryStatus(task.dueDate.toISOString(), task.status === 'COMPLETED' ? 'completed' : 'pending');

                                return (
                                    <React.Fragment key={task.id}>
                                        <ListItem
                                            disablePadding
                                            secondaryAction={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {task.priority === 'HIGH' && task.status !== 'COMPLETED' && (
                                                        <Chip label="BLOCKING" color="error" size="small" sx={{ fontWeight: 'bold' }} />
                                                    )}
                                                    <EvidenceLink hasEvidence={task.status === 'COMPLETED'} />
                                                </Box>
                                            }
                                            sx={{
                                                bgcolor: expiryInfo.label.includes('BLOCKING') ? '#FFEBEE' : 'inherit',
                                                '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                                            }}
                                        >
                                            <ListItemButton onClick={() => handleToggleTask(task.id, task.status)}>
                                                <ListItemIcon>
                                                    {task.status === 'COMPLETED'
                                                        ? <DoneIcon color="success" />
                                                        : expiryInfo.icon || <TodoIcon color="action" />
                                                    }
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <Typography
                                                            fontWeight={task.priority === 'HIGH' ? 'bold' : 'normal'}
                                                            sx={{ textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none', color: task.status === 'COMPLETED' ? 'text.secondary' : 'text.primary' }}
                                                        >
                                                            {task.title}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                            <Chip
                                                                label={expiryInfo.label}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: 'transparent',
                                                                    border: `1px solid ${expiryInfo.color}`,
                                                                    color: expiryInfo.color,
                                                                    fontWeight: 'bold',
                                                                    fontSize: '0.7rem',
                                                                    height: '20px'
                                                                }}
                                                            />
                                                        </Box>
                                                    }
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                        {index < punchListTasks.length - 1 && <Divider />}
                                    </React.Fragment>
                                );
                            })}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PunchList;
