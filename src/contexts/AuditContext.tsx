/**
 * AuditContext — append-only log of all significant user and system actions.
 *
 * Consumed by any component that needs to record an auditable event via `useAudit().addLog`.
 * Logs are kept in memory for the current session (no persistence in the current mock).
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/** A single immutable audit log entry. */
export interface AuditLog {
    id: string;
    timestamp: Date;
    /** Role of the user who triggered the action (or 'system' for automated events). */
    userRole: string;
    /** Action identifier, e.g. 'LOGIN', 'BATCH_CLOSED'. */
    action: string;
    /** Human-readable description of what happened. */
    details: string;
    /** IP address of the client (mocked to '192.168.1.1' for now). */
    ipAddress?: string;
}

interface AuditContextType {
    logs: AuditLog[];
    /**
     * Appends a new entry to the audit log.
     * @param action  - Uppercase action identifier (e.g. 'MEASUREMENT_SUBMITTED')
     * @param details - Free-text description of the event
     * @param userRole - Role of the acting user or 'system'
     */
    addLog: (action: string, details: string, userRole: string) => void;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export const AuditProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [logs, setLogs] = useState<AuditLog[]>([
        // Mock initial logs
        { id: '1', timestamp: new Date(Date.now() - 3600000), userRole: 'system', action: 'SYSTEM_STARTUP', details: 'MES Connection established' },
        { id: '2', timestamp: new Date(Date.now() - 1800000), userRole: 'plant_engineer', action: 'LOGIN', details: 'Successful login' },
    ]);

    const addLog = (action: string, details: string, userRole: string) => {
        const newLog: AuditLog = {
            id: `AUDIT-${Date.now()}`,
            timestamp: new Date(),
            userRole,
            action,
            details,
            ipAddress: '192.168.1.1' // Mock IP
        };
        setLogs(prev => [newLog, ...prev]);
    };

    return (
        <AuditContext.Provider value={{ logs, addLog }}>
            {children}
        </AuditContext.Provider>
    );
};

export const useAudit = (): AuditContextType => {
    const context = useContext(AuditContext);
    if (!context) {
        throw new Error('useAudit must be used within an AuditProvider');
    }
    return context;
};
