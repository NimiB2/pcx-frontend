import React, { useState } from 'react';
import {
    Badge,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    Box,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemButton,
    Button,
    Tooltip
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    CheckCircle as SuccessIcon,
    Delete as DeleteIcon,
    Circle as CircleIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotifications, AppNotification, NotificationType } from '../../contexts/NotificationContext';

const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
};

const NotificationBell: React.FC = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = (notification: AppNotification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
            handleClose();
        }
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        clearNotification(id);
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'INFO': return <InfoIcon color="info" />;
            case 'WARNING': return <WarningIcon color="warning" />;
            case 'ERROR': return <ErrorIcon color="error" />;
            case 'SUCCESS': return <SuccessIcon color="success" />;
            default: return <InfoIcon />;
        }
    };

    return (
        <React.Fragment>
            <Tooltip title="Notifications">
                <IconButton
                    onClick={handleClick}
                    size="large"
                    aria-controls={open ? 'notification-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    color="inherit"
                >
                    <Badge badgeContent={unreadCount} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                id="notification-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 4,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        width: 360,
                        maxHeight: 500,
                        display: 'flex',
                        flexDirection: 'column',
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&::before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">Notifications</Typography>
                    {unreadCount > 0 && (
                        <Tooltip title="Mark all as read">
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}>
                                <CheckIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
                <Divider />

                <Box sx={{ overflowY: 'auto', flexGrow: 1, maxHeight: 400 }}>
                    {notifications.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography color="text.secondary">No notifications</Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {notifications.map((notif) => (
                                <React.Fragment key={notif.id}>
                                    <ListItem
                                        alignItems="flex-start"
                                        disablePadding
                                        secondaryAction={
                                            <IconButton edge="end" aria-label="delete" size="small" onClick={(e) => handleDelete(e, notif.id)}>
                                                <DeleteIcon fontSize="small" sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }} />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemButton
                                            onClick={() => handleNotificationClick(notif)}
                                            sx={{
                                                bgcolor: notif.read ? 'inherit' : 'rgba(25, 118, 210, 0.04)',
                                                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                                                {getIcon(notif.type)}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
                                                        <Typography variant="subtitle2" component="span" fontWeight={notif.read ? 'normal' : 'bold'}>
                                                            {notif.title}
                                                        </Typography>
                                                        {!notif.read && <CircleIcon sx={{ fontSize: 10, color: 'primary.main' }} />}
                                                    </Box>
                                                }
                                                secondary={
                                                    <React.Fragment>
                                                        <Typography
                                                            sx={{ display: 'block', mt: 0.5 }}
                                                            component="span"
                                                            variant="body2"
                                                            color="text.primary"
                                                        >
                                                            {notif.message}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                            {timeAgo(notif.timestamp)}
                                                        </Typography>
                                                    </React.Fragment>
                                                }
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                    <Divider component="li" />
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </Box>
            </Menu>
        </React.Fragment >
    );
};

export default NotificationBell;
