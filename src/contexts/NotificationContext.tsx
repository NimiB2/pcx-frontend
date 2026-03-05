import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type NotificationType = 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    timestamp: Date;
    read: boolean;
    link?: string; // Optional URL to navigate to when clicked
}

interface NotificationContextType {
    notifications: AppNotification[];
    unreadCount: number;
    addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotification: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

// Initial mock notifications to show the system working
const initialNotifications: AppNotification[] = [
    {
        id: 'notif-1',
        title: 'Document Expiring Soon',
        message: 'Material Safety Data Sheet - HDPE is expiring in 15 days.',
        type: 'WARNING',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
        link: '/documents'
    },
    {
        id: 'notif-2',
        title: 'New Discrepancy Detected',
        message: 'Input-output mismatch detected on BATCH-2026-001.',
        type: 'ERROR',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        read: false,
        link: '/reconciliation'
    },
    {
        id: 'notif-3',
        title: 'VRCQ Approved',
        message: 'Batch BATCH-2026-002 VRCQ was approved by Sarah Supervisor.',
        type: 'SUCCESS',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
        link: '/vrcq'
    }
];

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);

    const unreadCount = notifications.filter(n => !n.read).length;

    const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
        const newNotif: AppNotification = {
            ...notif,
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            read: false,
        };
        setNotifications(prev => [newNotif, ...prev]);
    }, []);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            clearNotification,
            clearAll
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
