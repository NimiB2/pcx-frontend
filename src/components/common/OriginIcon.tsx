import React from 'react';
import { Tooltip, Box } from '@mui/material';
import {
    Person as ManualIcon,
    Memory as MesIcon,
    Scale as ScaleIcon
} from '@mui/icons-material';

export type OriginType = 'manual' | 'mes' | 'scale';

interface OriginIconProps {
    type: OriginType;
}

/**
 * OriginIcon Component
 * 
 * A visual indicator showing the data source origin of a measurement.
 * Displays different icons and tooltips for manual entry, MES scale data, or direct scale integration.
 * 
 * @component
 * @param {OriginIconProps} props - The component props.
 * @param {OriginType} props.type - The source type ('manual', 'mes', or 'scale').
 */
const OriginIcon: React.FC<OriginIconProps> = ({ type }) => {
    let icon = <ManualIcon fontSize="small" />;
    let tooltip = "Manual Entry";
    let color = "action";

    switch (type) {
        case 'mes':
            icon = <MesIcon fontSize="small" />;
            tooltip = "MES Machine Data (Automated)";
            color = "primary";
            break;
        case 'scale':
            icon = <ScaleIcon fontSize="small" />;
            tooltip = "Connected Scale Integration";
            color = "secondary";
            break;
        case 'manual':
        default:
            icon = <ManualIcon fontSize="small" />;
            tooltip = "Manual User Entry";
            color = "action";
            break;
    }

    return (
        <Tooltip title={tooltip}>
            <Box component="span" sx={{ display: 'inline-flex', verticalAlign: 'middle', color: `${color}.main` }}>
                {icon}
            </Box>
        </Tooltip>
    );
};

export default OriginIcon;
