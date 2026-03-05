import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Chip,
    OutlinedInput,
    SelectChangeEvent
} from '@mui/material';
import { useData, PunchListTask } from '../../contexts/DataContext';
import { useNotifications } from '../../contexts/NotificationContext';

interface TaskFormModalProps {
    open: boolean;
    onClose: () => void;
    taskToEdit?: PunchListTask | null;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const TaskFormModal: React.FC<TaskFormModalProps> = ({ open, onClose, taskToEdit }) => {
    const { punchListTasks, addTask, updateTaskDetails } = useData();
    const { addNotification } = useNotifications();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
    const [assignedTo, setAssignedTo] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [dependencies, setDependencies] = useState<string[]>([]);

    useEffect(() => {
        if (open) {
            if (taskToEdit) {
                setTitle(taskToEdit.title);
                setDescription(taskToEdit.description);
                setPriority(taskToEdit.priority);
                setAssignedTo(taskToEdit.assignedTo);
                setDueDate(taskToEdit.dueDate.toISOString().split('T')[0]);
                setDependencies(taskToEdit.dependencies || []);
            } else {
                setTitle('');
                setDescription('');
                setPriority('MEDIUM');
                setAssignedTo('');
                setDueDate('');
                setDependencies([]);
            }
        }
    }, [open, taskToEdit]);

    const availableTasks = punchListTasks.filter(t => t.id !== taskToEdit?.id);

    const handleDependenciesChange = (event: SelectChangeEvent<typeof dependencies>) => {
        const { target: { value } } = event;
        setDependencies(
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleSave = () => {
        if (!title.trim() || !dueDate) return;

        const payload = {
            title,
            description,
            priority,
            assignedTo,
            dueDate: new Date(dueDate),
            dependencies
        };

        if (taskToEdit) {
            updateTaskDetails(taskToEdit.id, payload);
            addNotification({
                title: 'Task Updated',
                message: `Task "${title}" updated.`,
                type: 'INFO'
            });
        } else {
            addTask(payload);
            addNotification({
                title: 'New Task Added',
                message: `Task "${title}" created.`,
                type: 'SUCCESS'
            });
        }
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{taskToEdit ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Task Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        multiline
                        rows={3}
                        fullWidth
                    />
                    <FormControl fullWidth>
                        <InputLabel>Priority</InputLabel>
                        <Select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as any)}
                            label="Priority"
                        >
                            <MenuItem value="HIGH">HIGH</MenuItem>
                            <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                            <MenuItem value="LOW">LOW</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Assigned To"
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Due Date"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        required
                    />
                    <FormControl fullWidth>
                        <InputLabel>Blocked By (Dependencies)</InputLabel>
                        <Select
                            multiple
                            value={dependencies}
                            onChange={handleDependenciesChange}
                            input={<OutlinedInput label="Blocked By (Dependencies)" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => {
                                        const task = punchListTasks.find(t => t.id === value);
                                        return <Chip key={value} label={task ? task.title : value} size="small" />;
                                    })}
                                </Box>
                            )}
                            MenuProps={MenuProps}
                        >
                            {availableTasks.map((t) => (
                                <MenuItem key={t.id} value={t.id}>
                                    {t.title}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button onClick={handleSave} variant="contained" disabled={!title.trim() || !dueDate}>
                    Save Task
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TaskFormModal;
