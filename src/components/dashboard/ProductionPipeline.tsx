import React, { useMemo } from 'react';
import { Box, Paper, Typography, Grid, Chip, Divider, useTheme } from '@mui/material';
import {
    MoveToInbox as IntakeIcon,
    Autorenew as MixingIcon,
    Grain as ExtrusionIcon,
    Inventory2 as UnificationIcon,
    LocalShipping as ShippingIcon,
    CheckCircle as CheckIcon,
    PlayArrow as RunIcon
} from '@mui/icons-material';
import { useData } from '../../contexts/DataContext';

interface PipelineStageProps {
    title: string;
    icon: React.ReactNode;
    batches: any[];
    isLast?: boolean;
    getIdentity: (code: string) => string;
}

const PipelineStage: React.FC<PipelineStageProps> = ({ title, icon, batches, isLast, getIdentity }) => {
    const theme = useTheme();
    const isActive = batches.length > 0;

    return (
        <Box sx={{ display: 'flex', flex: 1, position: 'relative', minWidth: 0 }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Header/Status */}
                <Box
                    sx={{
                        width: '100%',
                        mb: 2,
                        textAlign: 'center',
                        color: isActive ? theme.palette.primary.main : theme.palette.text.secondary
                    }}
                >
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            bgcolor: isActive ? `${theme.palette.primary.main}15` : theme.palette.action.selected,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto',
                            mb: 1,
                            border: `2px solid ${isActive ? theme.palette.primary.main : 'transparent'}`
                        }}
                    >
                        {icon}
                    </Box>
                    <Typography variant="subtitle2" fontWeight="bold">{title}</Typography>
                    {isActive ? (
                        <Chip
                            label="ACTIVE"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ mt: 0.5, height: 20, fontSize: '0.65rem' }}
                        />
                    ) : (
                        <Box sx={{ height: 20 }} />
                    )}
                </Box>

                {/* Batch Cards */}
                <Box sx={{ width: '100%', px: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {batches.map((batch) => (
                        <Paper
                            key={batch.id}
                            elevation={2}
                            sx={{
                                p: 1,
                                borderLeft: `4px solid ${theme.palette.success.main}`,
                                bgcolor: 'background.paper'
                            }}
                        >
                            <Typography variant="caption" display="block" color="text.secondary">
                                {batch.id}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" noWrap title={getIdentity(batch.productCode)}>
                                {getIdentity(batch.productCode)}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                <Typography variant="caption">{batch.operator}</Typography>
                                <Typography variant="caption" fontWeight="bold">
                                    {Math.round((batch.currentQuantity / batch.targetQuantity) * 100)}%
                                </Typography>
                            </Box>
                        </Paper>
                    ))}
                    {/* RunIcon removed for clarity */}
                </Box>
            </Box>

            {/* Connector Line */}
            {!isLast && (
                <Box
                    sx={{
                        position: 'absolute',
                        right: -10,
                        top: 32,
                        width: 20,
                        height: 2,
                        bgcolor: theme.palette.divider,
                        zIndex: 0
                    }}
                />
            )}
        </Box>
    );
};

const ProductionPipeline: React.FC = () => {
    const { batches, getIdentity } = useData();

    // Map batches to stages based on status or type (Simplified logic for demo)
    // Real logic would check 'currentProcessStep'
    const stages = useMemo(() => {
        const inProgress = batches.filter(b => b.status === 'IN_PROGRESS');

        return {
            intake: [] as any[], // Usually waiting or just started
            mixing: inProgress.filter(b => b.id.includes('003')), // Mock logic
            extrusion: inProgress.filter(b => b.id.includes('001')), // Mock logic
            unification: inProgress.filter(b => b.id.includes('004')), // Mock logic
            shipping: batches.filter(b => b.status === 'COMPLETED').slice(0, 2) // Last 2 completed
        };
    }, [batches]);

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">Live Production Pipeline</Typography>
                <Typography variant="body2" color="text.secondary">Real-time batch tracking across facility zones</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', overflowX: 'auto', pb: 2, gap: 2 }}>
                <PipelineStage
                    title="1. Intake"
                    icon={<IntakeIcon />}
                    batches={stages.intake}
                    getIdentity={getIdentity}
                />
                <PipelineStage
                    title="2. Mixing"
                    icon={<MixingIcon />}
                    batches={stages.mixing}
                    getIdentity={getIdentity}
                />
                <PipelineStage
                    title="3. Extrusion"
                    icon={<ExtrusionIcon />}
                    batches={stages.extrusion}
                    getIdentity={getIdentity}
                />
                <PipelineStage
                    title="4. Unification"
                    icon={<UnificationIcon />}
                    batches={stages.unification}
                    getIdentity={getIdentity}
                />
                <PipelineStage
                    title="5. Shipping"
                    icon={<ShippingIcon />}
                    batches={stages.shipping}
                    isLast
                    getIdentity={getIdentity}
                />
            </Box>
        </Paper>
    );
};

export default ProductionPipeline;
