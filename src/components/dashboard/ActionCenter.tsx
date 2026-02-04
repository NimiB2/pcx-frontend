import React, { useState } from 'react';
import {
    Paper,
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    Chip,
    Tabs,
    Tab,
    Badge,
    Button,
    Divider
} from '@mui/material';
import {
    Warning,
    Description,
    FactCheck,
    ArrowForward,
    AccessTime,
    CheckCircle
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { mockDocuments } from '../../mockData';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 0 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const ActionCenter: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const { discrepancies } = useData();

    // 1. Blocking Discrepancies
    const blockingIssues = discrepancies.filter(d => d.severity === 'HIGH' && d.status === 'OPEN');

    // 2. Expiring Documents
    const expiringDocs = mockDocuments.filter(d => d.status === 'EXPIRING_SOON' || d.status === 'EXPIRED');

    // 3. Manual Entries to Review (Mock logic: any open discrepancy with 'manual' source)
    // In real app, this would be a specific "pending approval" state
    const reviews = discrepancies.filter(d => d.severity === 'MEDIUM' && d.status === 'OPEN');

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Paper sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab
                        icon={<Badge badgeContent={blockingIssues.length} color="error"><Warning /></Badge>}
                        label="ALERTS"
                        sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}
                    />
                    <Tab
                        icon={<Badge badgeContent={reviews.length} color="warning"><FactCheck /></Badge>}
                        label="REVIEWS"
                        sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}
                    />
                    <Tab
                        icon={<Badge badgeContent={expiringDocs.length} color="error"><Description /></Badge>}
                        label="DOCS"
                        sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}
                    />
                </Tabs>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto' }}>
                {/* ALERTS TAB */}
                <TabPanel value={tabValue} index={0}>
                    {blockingIssues.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                            <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="body2">Automatic Monitor Clear</Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {blockingIssues.map(issue => (
                                <ListItemButton key={issue.id} component={Link} to="/reconciliation" divider>
                                    <ListItemText
                                        primary={<Typography variant="subtitle2" color="error" fontWeight="bold">BLOCKING DISCREPANCY</Typography>}
                                        secondary={issue.description}
                                    />
                                    <ArrowForward fontSize="small" color="action" />
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                </TabPanel>

                {/* REVIEWS TAB */}
                <TabPanel value={tabValue} index={1}>
                    {reviews.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                            <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="body2">No Pending Reviews</Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {reviews.map(review => (
                                <ListItemButton key={review.id} component={Link} to="/reconciliation" divider>
                                    <ListItemText
                                        primary="Manual Entry Variance"
                                        secondary={
                                            <React.Fragment>
                                                <Typography variant="caption" display="block">Batch: {review.batchId}</Typography>
                                                <Typography variant="caption" color="text.primary">"Scale reading looked off..."</Typography>
                                            </React.Fragment>
                                        }
                                    />
                                    <Chip label="Review" size="small" color="warning" variant="outlined" />
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                </TabPanel>

                {/* DOCS TAB */}
                <TabPanel value={tabValue} index={2}>
                    {expiringDocs.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                            <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="body2">All Documents Valid</Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {expiringDocs.map(doc => (
                                <ListItemButton key={doc.id} component={Link} to="/documents" divider>
                                    <ListItemText
                                        primary={doc.name}
                                        secondary={<Typography variant="caption" color="error">{doc.status.replace('_', ' ')}</Typography>}
                                    />
                                    <AccessTime color="error" fontSize="small" />
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                </TabPanel>
            </Box>

            <Box sx={{ p: 1, borderTop: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
                <Button fullWidth size="small" component={Link} to="/reconciliation">
                    View All Activity
                </Button>
            </Box>
        </Paper>
    );
};

export default ActionCenter;
