// Export all pages from here
import Reconciliation from './Reconciliation';
import VRCQManager from './VRCQManager';
import PunchList from './PunchList';
import UserManagement from './UserManagement';
import Reports from './Reports';
import Documents from './Documents';
import Codebook from './Codebook';
import React from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';
import { AdminLabel, FutureLabel } from '../components/common/Labels';

// Placeholder Pages (To be migrated later)
export const BatchDetail: React.FC = () => (
    <Box><Typography variant="h4">Batch Detail</Typography>
        <Paper sx={{ p: 3, mt: 2 }}><Typography>Detailed batch information will be displayed here</Typography></Paper></Box>
);

export const CreditAllocation: React.FC = () => (
    <Box>
        <Stack direction="row" alignItems="center" gap={1} mb={2}>
            <Typography variant="h4">Credit Allocation</Typography>
            <AdminLabel />
            <FutureLabel />
        </Stack>
        <Paper sx={{ p: 3, mt: 2 }}><Typography>Post-certification credit allocation (Aterum Admin only)</Typography></Paper>
    </Box>
);



// PunchList is imported above




export { Reconciliation, VRCQManager, PunchList, UserManagement, Reports, Documents, Codebook };
export default BatchDetail;
