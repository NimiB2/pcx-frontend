import React from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    LinearProgress,
    Button,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { mockBatches } from '../mockData';

const Batches: React.FC = () => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'IN_PROGRESS': return 'primary';
            case 'PENDING': return 'warning';
            default: return 'default';
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Batch Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Track production batches and material lineage
            </Typography>


            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
                {mockBatches.map((batch) => (
                    <Card key={batch.id}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    {batch.id}
                                </Typography>
                                <Chip
                                    label={batch.status}
                                    size="small"
                                    color={getStatusColor(batch.status)}
                                />
                            </Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {batch.productName}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 2 }}>
                                Recycled Content: <strong>{batch.recycledPercentage}%</strong>
                            </Typography>
                            <Typography variant="body2">
                                Progress: <strong>{batch.currentQuantity} / {batch.targetQuantity} kg</strong>
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={(batch.currentQuantity / batch.targetQuantity) * 100}
                                sx={{ mt: 1, mb: 2 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                                Operator: {batch.operator}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Button
                                    component={Link}
                                    to={`/batches/${batch.id}`}
                                    size="small"
                                    variant="outlined"
                                    fullWidth
                                >
                                    View Details
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Box>
    );
};

export default Batches;
