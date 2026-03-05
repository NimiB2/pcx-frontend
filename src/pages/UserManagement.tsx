import React, { useState } from 'react';
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
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    FormControlLabel,
    Switch
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    PersonAdd as PersonAddIcon,
    SupervisorAccount,
    Engineering,
    Construction,
    Policy,
    VerifiedUser,
    GppBad
} from '@mui/icons-material';
import StatusBadge from '../components/common/StatusBadge';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'super_admin' | 'plant_engineer' | 'field_worker' | 'regulatory';
    mfaEnabled: boolean;
    lastActive: string;
    status: 'ONLINE' | 'OFFLINE';
}

const initialUsers: User[] = [
    { id: '1', name: 'Sarah System', email: 'sarah@aterum.com', role: 'super_admin', mfaEnabled: true, lastActive: 'Now', status: 'ONLINE' },
    { id: '2', name: 'John Plant', email: 'john@aterum.com', role: 'plant_engineer', mfaEnabled: false, lastActive: '5m ago', status: 'ONLINE' },
    { id: '3', name: 'Mike Field', email: 'mike@aterum.com', role: 'field_worker', mfaEnabled: false, lastActive: '2h ago', status: 'OFFLINE' },
    { id: '4', name: 'Jane Regs', email: 'jane@aterum.com', role: 'regulatory', mfaEnabled: true, lastActive: '1d ago', status: 'OFFLINE' },
];

const roleConfig = {
    super_admin: { label: 'Super-Admin', color: 'primary' as const, icon: <SupervisorAccount sx={{ fontSize: 16 }} /> },
    plant_engineer: { label: 'Plant Engineer', color: 'info' as const, icon: <Engineering sx={{ fontSize: 16 }} /> },
    field_worker: { label: 'Field Worker', color: 'success' as const, icon: <Construction sx={{ fontSize: 16 }} /> },
    regulatory: { label: 'Regulatory', color: 'secondary' as const, icon: <Policy sx={{ fontSize: 16 }} /> },
};

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'field_worker' as User['role'],
        mfaEnabled: false
    });

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                role: user.role,
                mfaEnabled: user.mfaEnabled
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                role: 'field_worker',
                mfaEnabled: false
            });
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleSave = () => {
        if (editingUser) {
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
        } else {
            const newUser: User = {
                id: `TEMP-${Date.now()}`,
                name: formData.name,
                email: formData.email,
                role: formData.role,
                mfaEnabled: formData.mfaEnabled,
                lastActive: 'Never',
                status: 'OFFLINE'
            };
            setUsers([...users, newUser]);
        }
        setModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to remove this user?')) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                    User Management
                </Typography>
                <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => handleOpenModal()}>
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
                            <TableCell>MFA Status</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Last Active</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: roleConfig[user.role].color + '.main' }}>
                                            {user.name.charAt(0)}
                                        </Avatar>
                                        <Typography fontWeight="bold">{user.name}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip
                                        icon={roleConfig[user.role].icon}
                                        label={roleConfig[user.role].label}
                                        size="small"
                                        color={roleConfig[user.role].color}
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        icon={user.mfaEnabled ? <VerifiedUser sx={{ fontSize: 16 }} /> : <GppBad sx={{ fontSize: 16 }} />}
                                        label={user.mfaEnabled ? 'Enforced' : 'Not Configured'}
                                        size="small"
                                        color={user.mfaEnabled ? 'success' : 'warning'}
                                        variant="filled"
                                    />
                                </TableCell>
                                <TableCell>
                                    <StatusBadge
                                        status={user.status === 'ONLINE' ? 'success' : 'default'}
                                        label={user.status}
                                    />
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary' }}>{user.lastActive}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" color="primary" aria-label={`Edit user ${user.name}`} onClick={() => handleOpenModal(user)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="error" aria-label={`Delete user ${user.name}`} onClick={() => handleDelete(user.id)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create/Edit User Modal */}
            <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'grid', gap: 2 }}>
                        <TextField
                            label="Full Name"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            label="Email Address"
                            type="email"
                            fullWidth
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <TextField
                            select
                            label="Role"
                            fullWidth
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                        >
                            <MenuItem value="super_admin">Super-Admin</MenuItem>
                            <MenuItem value="plant_engineer">Plant Engineer</MenuItem>
                            <MenuItem value="field_worker">Field Worker</MenuItem>
                            <MenuItem value="regulatory">Regulatory</MenuItem>
                        </TextField>

                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fafafa' }}>
                            <Typography variant="subtitle2" gutterBottom>Security Settings</Typography>
                            <FormControlLabel
                                control={<Switch checked={formData.mfaEnabled} onChange={(e) => setFormData({ ...formData, mfaEnabled: e.target.checked })} />}
                                label="Require Multi-Factor Authentication (MFA)"
                            />
                            <Typography variant="caption" color="text.secondary" display="block">
                                Note: MFA is mandatorily enforced system-wide for Super-Admins in production.
                            </Typography>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button variant="contained" color="primary" onClick={handleSave} disabled={!formData.name || !formData.email}>
                        {editingUser ? 'Save Changes' : 'Create User'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserManagement;
