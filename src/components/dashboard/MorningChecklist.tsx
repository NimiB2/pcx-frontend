import React, { useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Checkbox,
    Chip,
    Button
} from '@mui/material';
import {
    Assignment,
    Scale,
    Sync,
    CheckCircleOutline,
    RadioButtonUnchecked,
    ArrowForward
} from '@mui/icons-material';
import ScaleCalibrationModal from '../modals/ScaleCalibrationModal';

const MorningChecklist: React.FC = () => {
    const [tasks, setTasks] = useState([
        { id: 'SCALE', label: 'Verify Scale Calibration', completed: false, icon: <Scale /> },
        { id: 'SYNC', label: 'Sync Offline Data', completed: false, icon: <Sync /> },
        { id: 'Safety', label: 'Safety Briefing Review', completed: false, icon: <Assignment /> }
    ]);

    const [modalOpen, setModalOpen] = useState(false);

    const handleTaskClick = (id: string) => {
        if (id === 'SCALE') {
            setModalOpen(true);
        } else {
            // Toggle others immediately for demo
            setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
        }
    };

    const handleCalibrationConfirmed = () => {
        setTasks(prev => prev.map(t => t.id === 'SCALE' ? { ...t, completed: true } : t));
    };

    const allCompleted = tasks.every(t => t.completed);

    if (allCompleted) {
        return (
            <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircleOutline fontSize="large" />
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold">Ready to Start</Typography>
                        <Typography variant="body2">Morning checklist complete</Typography>
                    </Box>
                </Box>
                <Button variant="contained" color="success" onClick={() => setTasks(prev => prev.map(t => ({ ...t, completed: false })))}>
                    Reset (Demo)
                </Button>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 0, overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <Typography variant="h6" fontWeight="bold">Morning Checklist</Typography>
                <Typography variant="caption">Complete these tasks before starting production</Typography>
            </Box>

            <List sx={{ p: 0 }}>
                {tasks.map((task, index) => (
                    <React.Fragment key={task.id}>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => handleTaskClick(task.id)} dense>
                                <ListItemIcon sx={{ minWidth: 40, color: task.completed ? 'success.main' : 'text.secondary' }}>
                                    {task.completed ? <CheckCircleOutline /> : <RadioButtonUnchecked />}
                                </ListItemIcon>
                                <ListItemText
                                    primary={task.label}
                                    secondary={task.id === 'SCALE' && !task.completed ? 'Tap to verify' : null}
                                />
                                {task.id === 'SCALE' && !task.completed && <Chip size="small" label="Action" color="primary" />}
                            </ListItemButton>
                        </ListItem>
                        {/* Divider except last */}
                    </React.Fragment>
                ))}
            </List>

            <ScaleCalibrationModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleCalibrationConfirmed}
            />
        </Paper>
    );
};

export default MorningChecklist;
