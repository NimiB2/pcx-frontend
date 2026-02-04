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
    FormControlLabel
} from '@mui/material';
import {
    Search,
    Add,
    Security,
    Visibility,
    VisibilityOff
} from '@mui/icons-material';
import { mockCodebook } from '../mockData';
import { useAuth } from '../contexts/AuthContext';

const Codebook: React.FC = () => {
    // In a real app, useData() would provide codebook actions
    // For now, we read from mock data
    const [searchTerm, setSearchTerm] = useState('');
    const [showRealIdentities, setShowRealIdentities] = useState(false);

    const codebookData = mockCodebook.filter(entry =>
        entry.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (showRealIdentities && entry.realIdentity.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const { user } = useAuth();
    // Double check admin rights, though router should handle this
    if (user?.role !== 'admin') {
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
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
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
                        {codebookData.map((row) => (
                            <TableRow key={row.code}>
                                <TableCell>
                                    <Chip
                                        label={row.code}
                                        sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}
                                    />
                                </TableCell>
                                <TableCell>{row.type}</TableCell>
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
                                    <Button size="small">Edit</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Codebook;
