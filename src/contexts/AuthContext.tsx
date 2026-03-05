/**
 * AuthContext — manages the active user session and role-based permission checks.
 *
 * Uses a set of mock users (one per role) so any role can be selected on the login page
 * without a real backend. Replace `MOCK_USERS` and `login` with real auth calls when
 * connecting to the backend.
 */
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { UserRole, hasPermission as checkPermission, isReadOnly as checkReadOnly, getRoleDisplayName } from '../utils/permissions';

// Re-export UserRole so consumers don't need an extra import
export type { UserRole } from '../utils/permissions';

export interface User {
    id: string;
    name: string;
    role: UserRole;
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (role: UserRole) => void;
    logout: () => void;
    isAuthenticated: boolean;
    /** Check if the current user has a specific permission */
    hasPermission: (permission: string) => boolean;
    /** Check if the current user has read-only access (Regulatory role) */
    isReadOnly: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * Mock user profiles per role.
 * Source: PRD §3 Personas, User Flows §2.1
 */
const MOCK_USERS: Record<UserRole, User> = {
    field_worker: {
        id: 'fw-1',
        name: 'John Operator',
        role: 'field_worker',
        email: 'john@aterum.com',
    },
    plant_engineer: {
        id: 'pe-1',
        name: 'Sarah Engineer',
        role: 'plant_engineer',
        email: 'sarah@aterum.com',
    },
    super_admin: {
        id: 'sa-1',
        name: 'Admin Manager',
        role: 'super_admin',
        email: 'admin@aterum.com',
    },
    regulatory: {
        id: 'reg-1',
        name: 'Alex Auditor',
        role: 'regulatory',
        email: 'auditor@regulatory.org',
    },
};

/**
 * Provides authentication state to the component tree.
 * Internally selects a mock user profile for the chosen role.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    /** Sets the active user to the mock profile for the given role. */
    const login = useCallback((role: UserRole) => {
        setUser(MOCK_USERS[role]);
    }, []);

    /** Clears the active user, effectively ending the session. */
    const logout = useCallback(() => {
        setUser(null);
    }, []);

    const hasPermissionFn = useCallback(
        (permission: string) => checkPermission(user?.role, permission as any),
        [user?.role]
    );

    const isReadOnly = user ? checkReadOnly(user.role) : false;

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated: !!user,
                hasPermission: hasPermissionFn,
                isReadOnly,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
