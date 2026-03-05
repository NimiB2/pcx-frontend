import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AuditLog {
    id: string;
    timestamp: Date;
    userRole: string;
    action: string;
    details: string;
    ipAddress?: string;
}

interface AuditContextType {
    logs: AuditLog[];
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
