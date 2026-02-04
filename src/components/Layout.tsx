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
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Science as MeasurementIcon,
    Inventory as BatchIcon,
    Assessment as VRCQIcon,
    Folder as DocumentIcon,
    Warning as ReconciliationIcon,
    Settings as AdminIcon,
    Lan as MesIcon, // For connectivity
    Menu as MenuIcon,
    People as UsersIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 260;




interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const theme = useTheme();

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        ...(user?.role === 'operator' ? [
            { text: 'Measurements', icon: <MeasurementIcon />, path: '/measurements' },
        ] : []),
        ...(user?.role === 'admin' ? [
            { text: 'Reconciliation', icon: <ReconciliationIcon />, path: '/reconciliation' },
            { text: 'Batch Management', icon: <BatchIcon />, path: '/batches' },
            { text: 'Mass Balance (VRCQ)', icon: <VRCQIcon />, path: '/vrcq' },
            { text: 'Reports & Logs', icon: <DocumentIcon />, path: '/reports' },
            { text: 'Documents & P.List', icon: <DocumentIcon />, path: '/documents' },
            { text: 'Codebook & Admin', icon: <AdminIcon />, path: '/codebook' },
            { text: 'User Management', icon: <UsersIcon />, path: '/users' },
        ] : []),
    ];

    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    // Data Context
    const { isMasked, toggleMasking } = useData();

    // Mock States for UI Demo (MES still mocked locally)
    const [mesOnline, setMesOnline] = useState(true);

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
            <List sx={{ pt: 2 }}>
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
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Action Header Items */}
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
                        {/* MES Connection Status */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #E0E0E0', padding: '4px 12px', borderRadius: '4px' }}>
                            <MesIcon sx={{ color: mesOnline ? theme.palette.success.main : theme.palette.error.main, fontSize: 20 }} />
                            <Typography variant="body2" fontWeight="bold">
                                MES: {mesOnline ? 'ONLINE' : 'OFFLINE'}
                            </Typography>
                        </Box>

                        {/* Masking Toggle */}
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
                    </Box>

                    {/* User Profile */}
                    <div>
                        <IconButton onClick={handleMenu} color="inherit">
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
                                <Typography variant="body2">
                                    {user?.name || 'User'} ({user?.role || 'Guest'})
                                </Typography>
                            </MenuItem>
                            <MenuItem onClick={handleClose}>Profile</MenuItem>
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
                {children}
            </Box>
        </Box>
    );
};

export default Layout;
