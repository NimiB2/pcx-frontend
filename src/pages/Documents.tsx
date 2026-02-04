import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    Divider,
    IconButton
} from '@mui/material';
import {
    UploadFile,
    Description,
    CheckCircle,
    Warning,
    Error as ErrorIcon,
    Download,
    Delete
} from '@mui/icons-material';
import { mockDocuments } from '../mockData';
import { useAuth } from '../contexts/AuthContext';

const Documents: React.FC = () => {
    // In a real app, we would fetch documents via DataContext or API
    // For now, we import the mock data directly
    const documents = mockDocuments;
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const getStatusChip = (status: string, expiryDate?: Date) => {
        if (status === 'VALID') {
            return <Chip icon={<CheckCircle />} label="VALID" color="success" size="small" variant="outlined" />;
        }
        if (status === 'EXPIRING_SOON') {
            return <Chip icon={<Warning />} label="EXPIRING SOON" color="warning" size="small" variant="outlined" />;
        }
        return <Chip icon={<ErrorIcon />} label="EXPIRED" color="error" size="small" variant="outlined" />;
    };

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Document Repository
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage certification evidence, permits, and calibration certificates.
                    </Typography>
                </Box>
                {isAdmin && (
                    <Button
                        variant="contained"
                        startIcon={<UploadFile />}
                        size="large"
                    >
                        Upload Document
                    </Button>
                )}
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper>
                        <List disablePadding>
                            {documents.map((doc, index) => (
                                <React.Fragment key={doc.id}>
                                    <ListItem
                                        sx={{ py: 2 }}
                                    >
                                        <ListItemIcon>
                                            <Description fontSize="large" color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {doc.name}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box sx={{ mt: 0.5 }}>
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        Type: {doc.type} • Uploaded: {doc.uploadDate.toLocaleDateString()}
                                                    </Typography>
                                                    {doc.expiryDate && (
                                                        <Typography variant="caption" display="block" color={doc.status !== 'VALID' ? 'error.main' : 'text.secondary'}>
                                                            Expires: {doc.expiryDate.toLocaleDateString()}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            {getStatusChip(doc.status, doc.expiryDate)}
                                            <Box>
                                                <IconButton title="Download">
                                                    <Download />
                                                </IconButton>
                                                {isAdmin && (
                                                    <IconButton title="Delete" color="error">
                                                        <Delete />
                                                    </IconButton>
                                                )}
                                            </Box>
                                        </Box>
                                    </ListItem>
                                    {index < documents.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                        <Typography variant="h6" gutterBottom>
                            Required Documents
                        </Typography>
                        <Typography variant="body2" paragraph color="text.secondary">
                            To maintain PCX certification status, the following document categories must remain valid:
                        </Typography>
                        <List dense>
                            <ListItem>
                                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                                <ListItemText primary="Business License" secondary="Annual Renewal" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                                <ListItemText primary="ISO 14001 / 9001" secondary="Every 3 years" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><Warning color="warning" fontSize="small" /></ListItemIcon>
                                <ListItemText primary="Scale Calibration" secondary="Required annually" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><ErrorIcon color="error" fontSize="small" /></ListItemIcon>
                                <ListItemText primary="Fire Safety Permit" secondary="Expired - Action Required" />
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Documents;
