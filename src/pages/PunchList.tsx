import React, { useState } from 'react';
import {
    Box, Typography, Paper, LinearProgress, List, ListItem,
    ListItemButton, ListItemText, ListItemIcon, Button, Chip, Divider, Grid, IconButton, Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    CheckCircle as DoneIcon,
    RadioButtonUnchecked as TodoIcon,
    Warning as AlertIcon,
    Block as BlockingIcon,
    Lock as LockIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon
} from '@mui/icons-material';
import EvidenceLink from '../components/common/EvidenceLink';
import { useData, PunchListTask } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import TaskFormModal from '../components/common/TaskFormModal';

const PunchList: React.FC = () => {
    const theme = useTheme();
    const { punchListTasks, updateTaskStatus, deleteTask } = useData();
    const { user } = useAuth();
    const canManageTasks = user?.role === 'super_admin';

    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<PunchListTask | null>(null);

    const completedCount = punchListTasks.filter(t => t.status === 'COMPLETED').length;
    const progress = punchListTasks.length > 0 ? (completedCount / punchListTasks.length) * 100 : 0;

    const isTaskBlocked = (task: PunchListTask): boolean => {
        if (!task.dependencies || task.dependencies.length === 0) return false;
        // Task is blocked if ANY dependency is NOT completed
        return task.dependencies.some(depId => {
            const depTask = punchListTasks.find(t => t.id === depId);
            return depTask && depTask.status !== 'COMPLETED';
        });
    };

    const handleToggleTask = (task: PunchListTask) => {
        if (isTaskBlocked(task)) {
            // Optional: Show a toast here that task is blocked
            return;
        }
        const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
        updateTaskStatus(task.id, newStatus);
    };

    const handleOpenAdd = () => {
        setEditingTask(null);
        setModalOpen(true);
    };

    const handleOpenEdit = (task: PunchListTask) => {
        setEditingTask(task);
        setModalOpen(true);
    };

    const handleDelete = (taskId: string) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            deleteTask(taskId);
        }
    };

    const getExpiryStatus = (dateStr: string, status: string) => {
        if (status === 'COMPLETED') return { label: 'VALID', color: theme.palette.success.main };

        const today = new Date(); // In real app use exact today
        const expiry = new Date(dateStr);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: 'OVERDUE', color: theme.palette.error.main, icon: <AlertIcon color="error" /> };
        if (diffDays < 7) return { label: `DUE IN ${diffDays} DAYS`, color: theme.palette.warning.main, icon: <AlertIcon color="warning" /> };

        return { label: `Due: ${expiry.toLocaleDateString()}`, color: theme.palette.text.secondary };
    };

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>Certification Readiness</Typography>
                    <Typography variant="subtitle1" color="text.secondary">Project: PCX-PILOT-2026</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {canManageTasks && (
                        <Button variant="outlined" startIcon={<AddIcon />} onClick={handleOpenAdd}>
                            Add Task
                        </Button>
                    )}
                    <Button variant="contained" color="primary" disabled={progress < 100}>
                        Request Final Audit
                    </Button>
                </Box>
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
                        <List disablePadding>
                            {punchListTasks.length === 0 && (
                                <ListItem>
                                    <ListItemText primary="No tasks configured." sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }} />
                                </ListItem>
                            )}
                            {punchListTasks.map((task, index) => {
                                const expiryInfo = getExpiryStatus(task.dueDate.toISOString(), task.status);
                                const isBlocked = isTaskBlocked(task);

                                return (
                                    <React.Fragment key={task.id}>
                                        <ListItem
                                            disablePadding
                                            secondaryAction={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {task.priority === 'HIGH' && task.status !== 'COMPLETED' && (
                                                        <Chip label="PRIORITY" color="error" size="small" sx={{ fontWeight: 'bold' }} />
                                                    )}
                                                    {isBlocked && task.status !== 'COMPLETED' && (
                                                        <Chip icon={<LockIcon fontSize="small" />} label="BLOCKED" color="warning" size="small" variant="outlined" />
                                                    )}
                                                    <EvidenceLink hasEvidence={task.status === 'COMPLETED'} />
                                                    {canManageTasks && (
                                                        <Box sx={{ ml: 2, display: 'flex' }}>
                                                            <IconButton size="small" aria-label={`Edit task ${task.title}`} onClick={() => handleOpenEdit(task)}>
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton size="small" color="error" aria-label={`Delete task ${task.title}`} onClick={() => handleDelete(task.id)}>
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    )}
                                                </Box>
                                            }
                                            sx={{
                                                bgcolor: isBlocked ? 'rgba(0,0,0,0.02)' : 'inherit',
                                                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                                                opacity: isBlocked ? 0.8 : 1
                                            }}
                                        >
                                            <Tooltip title={isBlocked ? 'Task is blocked by dependencies' : ''} placement="left">
                                                <span>
                                                    <ListItemButton
                                                        onClick={() => handleToggleTask(task)}
                                                        disabled={isBlocked && task.status !== 'COMPLETED'}
                                                    >
                                                        <ListItemIcon>
                                                            {task.status === 'COMPLETED'
                                                                ? <DoneIcon color="success" />
                                                                : isBlocked
                                                                    ? <LockIcon color="disabled" />
                                                                    : expiryInfo.icon || <TodoIcon color="action" />
                                                            }
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={
                                                                <Typography
                                                                    fontWeight={task.priority === 'HIGH' ? 'bold' : 'normal'}
                                                                    sx={{
                                                                        textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none',
                                                                        color: task.status === 'COMPLETED' ? 'text.secondary' : 'text.primary'
                                                                    }}
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
                                                                    {task.dependencies && task.dependencies.length > 0 && (
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            Depends on {task.dependencies.length} task(s)
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            }
                                                        />
                                                    </ListItemButton>
                                                </span>
                                            </Tooltip>
                                        </ListItem>
                                        {index < punchListTasks.length - 1 && <Divider />}
                                    </React.Fragment>
                                );
                            })}
                        </List>
                    </Paper>
                </Grid>
            </Grid>

            {/* Form Modal */}
            <TaskFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                taskToEdit={editingTask}
            />
        </Box>
    );
};

export default PunchList;
