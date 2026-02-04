import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Avatar,
    IconButton,
    Button
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    PersonAdd as PersonAddIcon,
    SupervisorAccount,
    Engineering
} from '@mui/icons-material';
import StatusBadge from '../components/common/StatusBadge';

// Mock Users Data
const mockUsers = [
    { id: '1', name: 'Sarah Supervisor', email: 'sarah@aterum.com', role: 'ADMIN', lastActive: 'Now', status: 'ONLINE' },
    { id: '2', name: 'John Operator', email: 'john@aterum.com', role: 'OPERATOR', lastActive: '5m aog', status: 'ONLINE' },
    { id: '3', name: 'Mike Tech', email: 'mike@aterum.com', role: 'OPERATOR', lastActive: '2h ago', status: 'OFFLINE' },
    { id: '4', name: 'Jane Manager', email: 'jane@aterum.com', role: 'Viewer', lastActive: '1d ago', status: 'OFFLINE' },
];

const UserManagement: React.FC = () => {
    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                    User Management
                </Typography>
                <Button variant="contained" startIcon={<PersonAddIcon />}>
                    Add New User
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Last Active</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {mockUsers.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: user.role === 'ADMIN' ? 'primary.main' : 'secondary.main' }}>
                                            {user.name.charAt(0)}
                                        </Avatar>
                                        <Typography fontWeight="bold">{user.name}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip
                                        icon={user.role === 'ADMIN' ? <SupervisorAccount sx={{ fontSize: 16 }} /> : <Engineering sx={{ fontSize: 16 }} />}
                                        label={user.role}
                                        size="small"
                                        color={user.role === 'ADMIN' ? 'primary' : 'default'}
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>
                                    <StatusBadge
                                        status={user.status === 'ONLINE' ? 'success' : 'default'}
                                        label={user.status}
                                    />
                                </TableCell>
                                <TableCell color="text.secondary">{user.lastActive}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" color="primary">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="error">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default UserManagement;
