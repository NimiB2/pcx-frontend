import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Switch,
    FormControlLabel,
    Chip,
    Divider,
    Paper,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Science as MeasurementIcon,
    Inventory as BatchIcon,
    Assessment as VRCQIcon,
    Folder as DocumentIcon,
    Warning as ReconciliationIcon,
    Settings as AdminIcon,
    Lan as MesIcon,
    Menu as MenuIcon,
    AccountTree as FlowIcon,
    People as UsersIcon,
    AccountBalance as CreditsIcon,
    EmojiEvents as TrophyIcon,
    Summarize as ReportsIcon,
    Checklist as PunchListIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useMES } from '../contexts/MESContext';
import { useTheme } from '@mui/material/styles';
import { UserRole, getRoleDisplayName } from '../utils/permissions';
import NotificationBell from './common/NotificationBell';

const drawerWidth = 260;

/**
 * Menu item configuration for the sidebar navigation.
 */
interface NavItem {
    text: string;
    icon: React.ReactElement;
    path: string;
}

/**
 * Role-based sidebar navigation configurations.
 * Source: User Flows §4.1-4.4
 */
const NAV_CONFIG: Record<UserRole, NavItem[]> = {
    field_worker: [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Measurements', icon: <MeasurementIcon />, path: '/measurements' },
        { text: 'Leaderboard', icon: <TrophyIcon />, path: '/leaderboard' },
    ],
    plant_engineer: [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Reconciliation', icon: <ReconciliationIcon />, path: '/reconciliation' },
        { text: 'Batch Management', icon: <BatchIcon />, path: '/batches' },
        { text: 'Mass Balance (VRCQ)', icon: <VRCQIcon />, path: '/vrcq' },
        { text: 'Material Flow', icon: <FlowIcon />, path: '/material-flow' },
        { text: 'Leaderboard', icon: <TrophyIcon />, path: '/leaderboard' },
        { text: 'Credits Dashboard', icon: <CreditsIcon />, path: '/credits/dashboard' },
        { text: 'Reports & Logs', icon: <ReportsIcon />, path: '/reports' },
        { text: 'Documents & P.List', icon: <DocumentIcon />, path: '/documents' },
    ],
    super_admin: [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Reconciliation', icon: <ReconciliationIcon />, path: '/reconciliation' },
        { text: 'Batch Management', icon: <BatchIcon />, path: '/batches' },
        { text: 'Mass Balance (VRCQ)', icon: <VRCQIcon />, path: '/vrcq' },
        { text: 'Material Flow', icon: <FlowIcon />, path: '/material-flow' },
        { text: 'Leaderboard', icon: <TrophyIcon />, path: '/leaderboard' },
        { text: 'Credits Dashboard', icon: <CreditsIcon />, path: '/credits/dashboard' },
        { text: 'Reports & Logs', icon: <ReportsIcon />, path: '/reports' },
        { text: 'Documents & P.List', icon: <DocumentIcon />, path: '/documents' },
        { text: 'Codebook & Admin', icon: <AdminIcon />, path: '/codebook' },
        { text: 'User Management', icon: <UsersIcon />, path: '/users' },
    ],
    regulatory: [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Reports & Audit Trail', icon: <ReportsIcon />, path: '/reports' },
        { text: 'VRCQ Data', icon: <VRCQIcon />, path: '/vrcq' },
        { text: 'Material Flow', icon: <FlowIcon />, path: '/material-flow' },
        { text: 'Documents', icon: <DocumentIcon />, path: '/documents' },
    ],
};

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const theme = useTheme();

    // Get menu items based on user role
    const menuItems: NavItem[] = user?.role ? NAV_CONFIG[user.role] || [] : [];

    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    // Data Context
    const { isMasked, toggleMasking } = useData();

    // Global MES Status
    const { isOnline: mesOnline, toggleMESStatus } = useMES();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
        navigate('/login');
    };

    const drawer = (
        <Box sx={{ height: '100%', backgroundColor: '#1A2027', color: '#FFFFFF' }}>
            <Toolbar sx={{ backgroundColor: '#000000', minHeight: '64px' }}>
                <Typography variant="h6" noWrap component="div" fontWeight="bold" sx={{ color: '#fff', letterSpacing: 1 }}>
                    PCX CONTROL
                </Typography>
            </Toolbar>
            <Divider sx={{ borderColor: '#424242' }} />

            {/* Role indicator */}
            {user && (
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Chip
                        label={getRoleDisplayName(user.role)}
                        size="small"
                        sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: '#B0BEC5',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            width: '100%',
                        }}
                    />
                </Box>
            )}

            <List sx={{ pt: 1 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                            component={Link}
                            to={item.path}
                            selected={location.pathname === item.path}
                            sx={{
                                '&.Mui-selected': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    borderLeft: `4px solid ${theme.palette.warning.main}`,
                                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
                                },
                                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                            }}
                        >
                            <ListItemIcon sx={{ color: '#E0E0E0', minWidth: 40 }}>{item.icon}</ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF' }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Box sx={{ position: 'absolute', bottom: 20, width: '100%', textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#757575' }}>
                    System Version 2.4.0
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    boxShadow: '0px 1px 3px rgba(0,0,0,0.1)',
                    borderBottom: '1px solid #E0E0E0'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                        aria-label="open navigation menu"
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Action Header Items */}
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
                        {/* MES Connection Status */}
                        <Box
                            onClick={toggleMESStatus}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                border: '1px solid #E0E0E0',
                                padding: '4px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: 'rgba(0,0,0,0.04)'
                                }
                            }}
                            title="Click to toggle proxy MES connection"
                        >
                            <MesIcon sx={{ color: mesOnline ? theme.palette.success.main : theme.palette.error.main, fontSize: 20 }} />
                            <Typography variant="body2" fontWeight="bold">
                                MES: {mesOnline ? 'ONLINE' : 'OFFLINE'}
                            </Typography>
                        </Box>

                        {/* Masking Toggle — only show for roles that have codebook access */}
                        {(user?.role === 'super_admin') && (
                            <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #E0E0E0', padding: '0px 12px', borderRadius: '4px' }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            size="small"
                                            checked={isMasked}
                                            onChange={toggleMasking}
                                            color="warning"
                                        />
                                    }
                                    label={
                                        <Typography variant="body2" fontWeight="bold" color="textSecondary">
                                            {isMasked ? "MASKING: ON" : "MASKING: OFF"}
                                        </Typography>
                                    }
                                />
                            </Box>
                        )}
                    </Box>

                    {/* Notifications */}
                    <Box sx={{ ml: 2, mr: 1 }}>
                        <NotificationBell />
                    </Box>

                    {/* User Profile */}
                    <div>
                        <IconButton onClick={handleMenu} color="inherit" aria-label="user menu">
                            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                                {user?.name?.charAt(0) || 'U'}
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem disabled>
                                <Box>
                                    <Typography variant="body2" fontWeight="bold">
                                        {user?.name || 'User'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {user?.role ? getRoleDisplayName(user.role) : 'Guest'}
                                    </Typography>
                                </Box>
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </div>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: 8,
                    backgroundColor: theme.palette.background.default,
                    minHeight: '100vh',
                }}
            >
                {!mesOnline && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            mb: 3,
                            bgcolor: 'error.light',
                            color: 'error.contrastText',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                        }}
                    >
                        <ReconciliationIcon />
                        <Typography variant="body1" fontWeight="bold">
                            MES Connection Unavailable: The system is operating in fallback mode. Some integration features are disabled.
                        </Typography>
                    </Paper>
                )}
                {children}
            </Box>
        </Box>
    );
};

export default Layout;
