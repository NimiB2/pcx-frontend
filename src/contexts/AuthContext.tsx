import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'operator';

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const login = (role: UserRole) => {
        // Simulate login based on selected role
        if (role === 'admin') {
            setUser({
                id: 'admin-1',
                name: 'Sarah Supervisor',
                role: 'admin',
                email: 'sarah@aterum.com'
            });
        } else {
            setUser({
                id: 'op-1',
                name: 'John Operator',
                role: 'operator',
                email: 'john@aterum.com'
            });
        }
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};
