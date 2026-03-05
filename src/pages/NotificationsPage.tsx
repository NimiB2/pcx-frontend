/**
 * NotificationsPage — full notification history for the authenticated user.
 *
 * Accessible by all roles. Supports filtering by type (INFO/WARNING/ERROR/SUCCESS)
 * and status (All/Unread/Read), plus bulk actions: Mark All Read and Clear All.
 * Reads from and writes to NotificationContext.
 */
import React, { useState } from 'react';

import {
    Box, Typography, Paper, List, ListItem, ListItemText, ListItemIcon,
    IconButton, Chip, Button, Divider, FormControl, InputLabel, Select, MenuItem,
    ToggleButtonGroup, ToggleButton
} from '@mui/material';
import {
    CheckCircle, Warning, Error as ErrorIcon, Info,
    Delete, OpenInNew, Check, ClearAll, FilterList
} from '@mui/icons-material';
import { useNotifications, AppNotification, NotificationType } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const typeIcons: Record<NotificationType, React.ReactElement> = {
    INFO: <Info color="info" />,
    WARNING: <Warning color="warning" />,
    ERROR: <ErrorIcon color="error" />,
    SUCCESS: <CheckCircle color="success" />
};

export const NotificationsPage: React.FC = () => {
    const { notifications, markAsRead, markAllAsRead, clearNotification, clearAll } = useNotifications();
    const navigate = useNavigate();

    const [filterType, setFilterType] = useState<NotificationType | 'ALL'>('ALL');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');

    const handleAction = (notif: AppNotification) => {
        if (!notif.read) markAsRead(notif.id);
        if (notif.link) navigate(notif.link);
    };

    const formatTimestamp = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const filteredNotifications = notifications.filter(n => {
        const typeMatch = filterType === 'ALL' || n.type === filterType;
        const statusMatch = filterStatus === 'ALL' ||
            (filterStatus === 'UNREAD' && !n.read) ||
            (filterStatus === 'READ' && n.read);
        return typeMatch && statusMatch;
    });

    return (
        <Box sx={{ pb: 8, maxWidth: 1000, mx: 'auto' }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Notification Center
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Review system alerts, action items, and audit events.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Check />}
                        onClick={markAllAsRead}
                        disabled={notifications.every(n => n.read)}
                    >
                        Mark All Read
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<ClearAll />}
                        onClick={clearAll}
                        disabled={notifications.length === 0}
                    >
                        Clear All
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ mb: 3, p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', bgcolor: 'grey.50' }}>
                <FilterList color="action" />
                <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 2 }}>Filters:</Typography>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                        value={filterType}
                        label="Type"
                        onChange={(e) => setFilterType(e.target.value as any)}
                    >
                        <MenuItem value="ALL">All Types</MenuItem>
                        <MenuItem value="INFO">Information</MenuItem>
                        <MenuItem value="SUCCESS">Success</MenuItem>
                        <MenuItem value="WARNING">Warnings</MenuItem>
                        <MenuItem value="ERROR">Errors</MenuItem>
                    </Select>
                </FormControl>

                <ToggleButtonGroup
                    value={filterStatus}
                    exclusive
                    onChange={(_, v) => v && setFilterStatus(v)}
                    size="small"
                >
                    <ToggleButton value="ALL">All</ToggleButton>
                    <ToggleButton value="UNREAD">Unread</ToggleButton>
                    <ToggleButton value="READ">Read</ToggleButton>
                </ToggleButtonGroup>
            </Paper>

            <Paper sx={{ overflow: 'hidden' }}>
                <List disablePadding>
                    {filteredNotifications.length === 0 ? (
                        <ListItem sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                            <Typography color="text.secondary">No notifications matching criteria.</Typography>
                        </ListItem>
                    ) : (
                        filteredNotifications.map((notif, index) => (
                            <React.Fragment key={notif.id}>
                                <ListItem
                                    alignItems="flex-start"
                                    sx={{
                                        py: 2.5,
                                        bgcolor: notif.read ? 'transparent' : 'primary.50',
                                        transition: 'background-color 0.3s ease',
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                    secondaryAction={
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                            {notif.link && (
                                                <Button
                                                    size="small"
                                                    variant="text"
                                                    endIcon={<OpenInNew />}
                                                    onClick={() => handleAction(notif)}
                                                >
                                                    View
                                                </Button>
                                            )}
                                            <IconButton edge="end" aria-label="Delete notification" onClick={() => clearNotification(notif.id)}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    }
                                >
                                    <ListItemIcon sx={{ mt: 0.5, minWidth: 48 }}>
                                        {typeIcons[notif.type]}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
                                                <Typography variant="subtitle1" fontWeight={notif.read ? 'medium' : 'bold'}>
                                                    {notif.title}
                                                </Typography>
                                                {!notif.read && (
                                                    <Chip label="NEW" color="primary" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />
                                                )}
                                                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', mr: 8 }}>
                                                    {formatTimestamp(notif.timestamp)}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <Typography variant="body2" color={notif.read ? 'text.secondary' : 'text.primary'}>
                                                {notif.message}
                                            </Typography>
                                        }
                                        sx={{ m: 0, pr: 10 }} // Right padding for action buttons
                                    />
                                </ListItem>
                                {index < filteredNotifications.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))
                    )}
                </List>
            </Paper>
        </Box>
    );
};

export default NotificationsPage;
