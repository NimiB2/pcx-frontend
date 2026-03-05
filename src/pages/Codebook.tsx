import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    TextField,
    InputAdornment,
    Switch,
    FormControlLabel,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem
} from '@mui/material';
import {
    Search,
    Add,
    Security,
    Visibility,
    VisibilityOff,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { mockCodebook } from '../mockData';
import { useAuth } from '../contexts/AuthContext';

export interface CodebookEntry {
    code: string;
    realIdentity: string;
    type: string;
    status: 'ACTIVE' | 'INACTIVE';
}

const Codebook: React.FC = () => {
    const { user } = useAuth();

    const [codes, setCodes] = useState<CodebookEntry[]>(mockCodebook as CodebookEntry[]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showRealIdentities, setShowRealIdentities] = useState(false);

    // Modal State
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingCode, setEditingCode] = useState<CodebookEntry | null>(null);
    const [formData, setFormData] = useState<CodebookEntry>({
        code: '',
        realIdentity: '',
        type: 'SUPPLIER',
        status: 'ACTIVE'
    });

    const filteredCodes = codes.filter(entry =>
        entry.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (showRealIdentities && entry.realIdentity.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleOpenModal = (code?: CodebookEntry) => {
        if (code) {
            setEditingCode(code);
            setFormData(code);
        } else {
            setEditingCode(null);
            setFormData({
                code: '',
                realIdentity: '',
                type: 'SUPPLIER',
                status: 'ACTIVE'
            });
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleSave = () => {
        if (editingCode) {
            setCodes(codes.map(c => c.code === editingCode.code ? formData : c));
        } else {
            // Ensure unique code
            if (codes.some(c => c.code === formData.code)) {
                alert("Code must be unique!");
                return;
            }
            setCodes([...codes, formData]);
        }
        setModalOpen(false);
    };

    const handleDelete = (code: string) => {
        if (window.confirm(`Are you sure you want to delete ${code}? This may affect historical data visibility.`)) {
            setCodes(codes.filter(c => c.code !== code));
        }
    };

    if (user?.role !== 'super_admin') {
        return <Typography color="error">Access Denied. Admins only.</Typography>;
    }

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Codebook Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage confidential identity mappings (Suppliers, Customers, Materials).
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenModal()}
                >
                    New Code Entry
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        placeholder="Search codes..."
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                            }
                        }}
                        sx={{ width: 300 }}
                    />
                    <Box sx={{ flexGrow: 1 }} />

                    <Paper
                        variant="outlined"
                        sx={{
                            p: '4px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            bgcolor: showRealIdentities ? 'warning.light' : 'transparent',
                            borderColor: showRealIdentities ? 'warning.main' : 'divider'
                        }}
                    >
                        <FormControlLabel
                            control={
                                <Switch
                                    size="small"
                                    checked={showRealIdentities}
                                    onChange={() => setShowRealIdentities(!showRealIdentities)}
                                    color="warning"
                                />
                            }
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {showRealIdentities ? <Visibility /> : <VisibilityOff />}
                                    <Typography variant="body2" fontWeight="bold">
                                        {showRealIdentities ? "REVEALING IDENTITIES" : "IDENTITIES MASKED"}
                                    </Typography>
                                </Box>
                            }
                        />
                    </Paper>
                </Box>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#eee' }}>
                        <TableRow>
                            <TableCell><b>Privacy Code</b></TableCell>
                            <TableCell><b>Type</b></TableCell>
                            <TableCell><b>Real Identity</b></TableCell>
                            <TableCell><b>Status</b></TableCell>
                            <TableCell align="right"><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCodes.map((row) => (
                            <TableRow key={row.code} hover>
                                <TableCell>
                                    <Chip
                                        label={row.code}
                                        sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}
                                    />
                                </TableCell>
                                <TableCell>{row.type.replace('_', ' ')}</TableCell>
                                <TableCell>
                                    {showRealIdentities ? (
                                        <Typography fontWeight="bold">{row.realIdentity}</Typography>
                                    ) : (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontStyle: 'italic' }}>
                                            <Security fontSize="small" />
                                            <span>Hidden</span>
                                        </Box>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={row.status}
                                        color={row.status === 'ACTIVE' ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" color="primary" aria-label={`Edit definition for ${row.code}`} onClick={() => handleOpenModal(row)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="error" aria-label={`Delete definition for ${row.code}`} onClick={() => handleDelete(row.code)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredCodes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No codes found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle>{editingCode ? 'Edit Code Entry' : 'New Code Entry'}</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'grid', gap: 2 }}>
                        <TextField
                            label="Privacy Code"
                            fullWidth
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            disabled={!!editingCode} /* Disallow changing code ID once created for simplicity */
                            helperText={editingCode ? "Privacy code cannot be changed after creation." : "E.g., SUP-A, MAT-001"}
                        />
                        <TextField
                            label="Real Identity"
                            fullWidth
                            value={formData.realIdentity}
                            onChange={(e) => setFormData({ ...formData, realIdentity: e.target.value })}
                            helperText="The actual name of the supplier, customer, or material."
                        />
                        <TextField
                            select
                            label="Entity Type"
                            fullWidth
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <MenuItem value="SUPPLIER">Supplier</MenuItem>
                            <MenuItem value="CUSTOMER">Customer</MenuItem>
                            <MenuItem value="MATERIAL_TYPE">Material Type</MenuItem>
                        </TextField>
                        <TextField
                            select
                            label="Status"
                            fullWidth
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                        >
                            <MenuItem value="ACTIVE">Active</MenuItem>
                            <MenuItem value="INACTIVE">Inactive</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={!formData.code || !formData.realIdentity}
                    >
                        {editingCode ? 'Save Changes' : 'Create Entry'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Codebook;
