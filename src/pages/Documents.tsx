import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, Button, List, ListItem, ListItemText,
    ListItemIcon, Chip, Divider, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, MenuItem, FormControl, InputLabel, Select, Collapse
} from '@mui/material';
import {
    UploadFile, Description, CheckCircle, Warning, Error as ErrorIcon,
    Download, Delete, History, ExpandMore, ExpandLess, Add
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { documentService, DocumentRecord, DocumentVersion, CreateDocumentInput, UpdateDocumentVersionInput, DocumentType } from '../services/documentService';
import { useNotifications } from '../contexts/NotificationContext';
import FileUpload from '../components/common/FileUpload';

const Documents: React.FC = () => {
    const [documents, setDocuments] = useState<DocumentRecord[]>([]);
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const canManageDocuments = user?.role === 'super_admin' || user?.role === 'plant_engineer';

    // Modal states
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploadMode, setUploadMode] = useState<'NEW' | 'VERSION'>('NEW');
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [expandedDocs, setExpandedDocs] = useState<{ [key: string]: boolean }>({});

    // Form states
    const [file, setFile] = useState<File | null>(null);
    const [docName, setDocName] = useState('');
    const [docType, setDocType] = useState<DocumentType>('Other');
    const [expiryDate, setExpiryDate] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const unsubscribe = documentService.subscribe((docs) => {
            setDocuments(docs);
        });
        return unsubscribe;
    }, []);

    const toggleExpand = (id: string) => {
        setExpandedDocs(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getStatusChip = (status: string, expiry?: Date) => {
        if (status === 'VALID') return <Chip icon={<CheckCircle />} label="VALID" color="success" size="small" variant="outlined" />;
        if (status === 'EXPIRING_SOON') return <Chip icon={<Warning />} label="EXPIRING SOON" color="warning" size="small" variant="outlined" />;
        return <Chip icon={<ErrorIcon />} label="EXPIRED" color="error" size="small" variant="outlined" />;
    };

    const handleOpenNewDoc = () => {
        setUploadMode('NEW');
        setSelectedDocId(null);
        setFile(null);
        setDocName('');
        setDocType('Other');
        setExpiryDate('');
        setNotes('');
        setUploadModalOpen(true);
    };

    const handleOpenNewVersion = (doc: DocumentRecord) => {
        setUploadMode('VERSION');
        setSelectedDocId(doc.id);
        setFile(null);
        setDocName(doc.name); // Read-only for display
        setExpiryDate(doc.expiryDate ? doc.expiryDate.toISOString().split('T')[0] : '');
        setNotes('');
        setUploadModalOpen(true);
    };

    const handleCloseModal = () => {
        setUploadModalOpen(false);
    };

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
    };

    const handleSubmitUpload = () => {
        if (!file) return;

        const uploader = user?.name || 'Unknown User';

        if (uploadMode === 'NEW') {
            const input: CreateDocumentInput = {
                name: docName,
                type: docType,
                fileName: file.name,
                fileSize: file.size,
                uploadedBy: uploader,
                expiryDate: expiryDate ? new Date(expiryDate) : undefined,
                notes
            };
            documentService.create(input);
            addNotification({
                title: 'Document Uploaded',
                message: `${docName} was successfully uploaded.`,
                type: 'SUCCESS',
                link: '/documents'
            });
        } else if (uploadMode === 'VERSION' && selectedDocId) {
            const input: UpdateDocumentVersionInput = {
                documentId: selectedDocId,
                fileName: file.name,
                fileSize: file.size,
                uploadedBy: uploader,
                expiryDate: expiryDate ? new Date(expiryDate) : undefined,
                notes
            };
            documentService.addVersion(input);
            addNotification({
                title: 'New Document Version',
                message: `Version added to ${docName}.`,
                type: 'INFO',
                link: '/documents'
            });
        }
        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this entire document and all its versions?')) {
            documentService.delete(id);
        }
    };

    const formatFileSize = (bytes: number) => {
        const mb = bytes / (1024 * 1024);
        return mb.toFixed(2) + ' MB';
    };

    return (
        <Box sx={{ pb: 8 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Document Repository
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage certification evidence, permits, and calibration certificates.
                    </Typography>
                </Box>
                {canManageDocuments && (
                    <Button
                        variant="contained"
                        startIcon={<UploadFile />}
                        size="large"
                        onClick={handleOpenNewDoc}
                    >
                        Upload Document
                    </Button>
                )}
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper>
                        <List disablePadding>
                            {documents.length === 0 && (
                                <ListItem>
                                    <ListItemText primary="No documents uploaded yet." sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }} />
                                </ListItem>
                            )}
                            {documents.map((doc, index) => {
                                const isExpanded = !!expandedDocs[doc.id];
                                const latestVersion = doc.versions[0];
                                return (
                                    <React.Fragment key={doc.id}>
                                        <ListItem sx={{ py: 2, alignItems: 'flex-start' }}>
                                            <ListItemIcon sx={{ mt: 1 }}>
                                                <Description fontSize="large" color="primary" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                            {doc.name}
                                                        </Typography>
                                                        <Chip label={`v${doc.currentVersion}`} size="small" />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box sx={{ mt: 0.5 }}>
                                                        <Typography variant="caption" display="block" color="text.secondary">
                                                            Type: {doc.type} • ID: {doc.id}
                                                        </Typography>
                                                        {doc.expiryDate && (
                                                            <Typography variant="caption" display="block" color={doc.status !== 'VALID' ? 'error.main' : 'text.secondary'}>
                                                                Expires: {doc.expiryDate.toLocaleDateString()}
                                                            </Typography>
                                                        )}
                                                        <Button
                                                            size="small"
                                                            onClick={() => toggleExpand(doc.id)}
                                                            endIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
                                                            sx={{ mt: 1, p: 0, textTransform: 'none' }}
                                                        >
                                                            {isExpanded ? 'Hide History' : 'View History'}
                                                        </Button>
                                                    </Box>
                                                }
                                            />
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {getStatusChip(doc.status, doc.expiryDate)}
                                                </Box>
                                                <Box sx={{ mt: 1 }}>
                                                    <IconButton title="Download Latest" aria-label={`Download latest version of ${doc.name}`}>
                                                        <Download fontSize="small" />
                                                    </IconButton>
                                                    {canManageDocuments && (
                                                        <>
                                                            <IconButton title="Upload New Version" color="primary" aria-label={`Upload new version for ${doc.name}`} onClick={() => handleOpenNewVersion(doc)}>
                                                                <UploadFile fontSize="small" />
                                                            </IconButton>
                                                            <IconButton title="Delete" color="error" aria-label={`Delete document ${doc.name}`} onClick={() => handleDelete(doc.id)}>
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                </Box>
                                            </Box>
                                        </ListItem>

                                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                            <Box sx={{ pl: 9, pr: 2, pb: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                                                <Typography variant="overline" color="text.secondary" fontWeight="bold">Version History</Typography>
                                                <List dense disablePadding>
                                                    {doc.versions.map(v => (
                                                        <ListItem key={v.id} sx={{ py: 0.5 }}>
                                                            <ListItemIcon sx={{ minWidth: 32 }}><History fontSize="small" color="disabled" /></ListItemIcon>
                                                            <ListItemText
                                                                primary={`v${v.versionNumber}: ${v.fileName} (${formatFileSize(v.fileSize)})`}
                                                                secondary={`Uploaded: ${v.uploadDate.toLocaleString()} by ${v.uploadedBy}${v.notes ? ` • Note: ${v.notes}` : ''}`}
                                                                primaryTypographyProps={{ variant: 'body2' }}
                                                                secondaryTypographyProps={{ variant: 'caption' }}
                                                            />
                                                            <IconButton size="small" title="Download this version" aria-label={`Download version ${v.versionNumber} of ${doc.name}`}>
                                                                <Download fontSize="small" />
                                                            </IconButton>
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Box>
                                        </Collapse>

                                        {index < documents.length - 1 && <Divider />}
                                    </React.Fragment>
                                );
                            })}
                        </List>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    {/* Alerts / Required Docs summary */}
                    <Paper sx={{ p: 3, bgcolor: '#f5f5f5', mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Required Documents
                        </Typography>
                        <Typography variant="body2" paragraph color="text.secondary">
                            To maintain PCX certification status, the following document categories must remain valid:
                        </Typography>
                        <List dense>
                            {['License', 'Certificate', 'Permit'].map(type => {
                                const docsOfType = documents.filter(d => d.type === type);
                                const hasValid = docsOfType.some(d => d.status === 'VALID');
                                const hasExpiring = docsOfType.some(d => d.status === 'EXPIRING_SOON');
                                const hasExpired = docsOfType.some(d => d.status === 'EXPIRED');

                                let icon = <CheckCircle color="success" fontSize="small" />;
                                let statusText = 'Up to date';

                                if (hasExpired || docsOfType.length === 0) {
                                    icon = <ErrorIcon color="error" fontSize="small" />;
                                    statusText = docsOfType.length === 0 ? 'Missing' : 'Action Required';
                                } else if (hasExpiring) {
                                    icon = <Warning color="warning" fontSize="small" />;
                                    statusText = 'Expiring Soon';
                                }

                                return (
                                    <ListItem key={type}>
                                        <ListItemIcon>{icon}</ListItemIcon>
                                        <ListItemText primary={type} secondary={statusText} />
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Paper>
                </Grid>
            </Grid>

            {/* Upload Modal */}
            <Dialog open={uploadModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {uploadMode === 'NEW' ? 'Upload New Document' : `Upload New Version: ${docName}`}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {!file ? (
                            <FileUpload onFileSelect={handleFileSelect} maxSizeMB={20} />
                        ) : (
                            <Paper variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.light', color: 'white' }}>
                                <Typography variant="body2" fontWeight="bold">{file.name} ({formatFileSize(file.size)})</Typography>
                                <Button size="small" color="inherit" onClick={() => setFile(null)}>Remove</Button>
                            </Paper>
                        )}

                        {uploadMode === 'NEW' && (
                            <>
                                <TextField
                                    label="Document Name"
                                    fullWidth
                                    value={docName}
                                    onChange={e => setDocName(e.target.value)}
                                    required
                                />
                                <FormControl fullWidth>
                                    <InputLabel>Document Type</InputLabel>
                                    <Select
                                        value={docType}
                                        label="Document Type"
                                        onChange={e => setDocType(e.target.value as DocumentType)}
                                    >
                                        <MenuItem value="License">License</MenuItem>
                                        <MenuItem value="Permit">Permit</MenuItem>
                                        <MenuItem value="Certificate">Certificate</MenuItem>
                                        <MenuItem value="Evidence">Evidence</MenuItem>
                                        <MenuItem value="Policy">Policy</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </>
                        )}

                        <TextField
                            label="Expiry Date (Optional)"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            value={expiryDate}
                            onChange={e => setExpiryDate(e.target.value)}
                        />

                        <TextField
                            label="Version Notes (Optional)"
                            multiline
                            rows={2}
                            fullWidth
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="inherit">Cancel</Button>
                    <Button
                        onClick={handleSubmitUpload}
                        variant="contained"
                        disabled={!file || (uploadMode === 'NEW' && !docName)}
                    >
                        Upload
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Documents;
