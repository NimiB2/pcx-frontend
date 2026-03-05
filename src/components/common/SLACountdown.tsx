import React, { useState, useEffect } from 'react';
import { Chip, Tooltip } from '@mui/material';
import { AccessTime, Warning, Error as ErrorIcon, CheckCircle } from '@mui/icons-material';

/** Props for the SLACountdown component. */
interface SLACountdownProps {
    /** The SLA deadline. If omitted, a 'No SLA' chip is shown. */
    deadline?: Date;
    /** The time the item was resolved. Used to determine if the SLA was met. */
    resolvedAt?: Date;
    /** Current status of the discrepancy (e.g. 'OPEN', 'RESOLVED'). Controls display logic. */
    status: string;
}

/**
 * SLACountdown Component
 *
 * Displays a real-time countdown chip until the SLA deadline.
 * - OPEN items: counts down remaining hours/minutes; turns red when overdue.
 * - RESOLVED items: shows whether the SLA was met or missed.
 * - No deadline: shows a neutral 'No SLA' chip.
 *
 * The countdown ticks every minute via a `setInterval`.
 */
const SLACountdown: React.FC<SLACountdownProps> = ({ deadline, resolvedAt, status }) => {
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isOverdue, setIsOverdue] = useState(false);

    useEffect(() => {
        if (!deadline || status === 'RESOLVED') return;

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const distance = deadline.getTime() - now;

            if (distance < 0) {
                setIsOverdue(true);
                setTimeLeft('Overdue');
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

            setTimeLeft(`${hours}h ${minutes}m`);
            setIsOverdue(false);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [deadline, status]);

    if (!deadline) {
        return <Chip label="No SLA" size="small" variant="outlined" />;
    }

    if (status === 'RESOLVED' && resolvedAt) {
        const metSla = resolvedAt.getTime() <= deadline.getTime();
        return (
            <Tooltip title={`Resolved at ${resolvedAt.toLocaleString()}`}>
                <Chip
                    icon={<CheckCircle />}
                    label={metSla ? "SLA Met" : "Resolved Late"}
                    size="small"
                    color={metSla ? "success" : "warning"}
                    variant="outlined"
                />
            </Tooltip>
        );
    }

    if (status === 'RESOLVED') {
        return <Chip label="Resolved" size="small" color="success" variant="outlined" />;
    }

    return (
        <Tooltip title={`Deadline: ${deadline.toLocaleString()}`}>
            <Chip
                icon={isOverdue ? <ErrorIcon /> : <AccessTime />}
                label={timeLeft}
                size="small"
                color={isOverdue ? "error" : "warning"}
                variant={isOverdue ? "filled" : "outlined"}
                sx={{ fontWeight: 'bold' }}
            />
        </Tooltip>
    );
};

export default SLACountdown;
