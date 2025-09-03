

'use client';

import { useEffect, useState, useCallback, createContext, useContext, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUsers, getPermissions, type User, getClients, type Client, setUserStatus } from '@/lib/data';
import type { Page } from '@/lib/definitions';
import { useToast } from './use-toast';

type LinkType = {
    href: string;
    label: string;
    icon: React.ElementType;
    pageName: Page;
};

type AuthContextType = {
    currentUser: User | null;
    users: User[];
    clients: Client[];
    isLoading: boolean;
    visibleLinks: LinkType[];
    setCurrentUser: (user: User | null) => void;
    resetInactivityTimer: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export function AuthProvider({ children, allLinks }: { children: React.ReactNode, allLinks: LinkType[] }) {
    const [currentUser, _setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [visibleLinks, setVisibleLinks] = useState<LinkType[]>([]);
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();
    const inactivityTimer = useRef<NodeJS.Timeout>();
    
    const logout = useCallback(async () => {
        if (currentUser) {
            await setUserStatus(currentUser.id, 'offline');
        }
        localStorage.removeItem('loggedInUserId');
        _setCurrentUser(null);
        router.push('/login');
        toast({
            title: "Sesión Cerrada",
            description: "Tu sesión se ha cerrado.",
        });
    }, [router, toast, currentUser]);
    
    const resetInactivityTimer = useCallback(() => {
        clearTimeout(inactivityTimer.current);
        inactivityTimer.current = setTimeout(logout, INACTIVITY_TIMEOUT);
    }, [logout]);


    const setCurrentUser = useCallback((user: User | null) => {
        _setCurrentUser(user);
        if (user) {
            resetInactivityTimer();
        } else {
            clearTimeout(inactivityTimer.current);
        }
    }, [resetInactivityTimer]);
    
     const checkAuthStatus = useCallback(async () => {
        const userId = localStorage.getItem('loggedInUserId');
        
        if (!userId) {
            setCurrentUser(null);
            setIsLoading(false);
            if (pathname !== '/login') {
                router.push('/login');
            }
            return;
        }

        try {
            const [allUsersData, allClientsData, permissions] = await Promise.all([
                getUsers(),
                getClients(),
                getPermissions()
            ]);

            const user = allUsersData.find(u => u.id === userId);

            if (user) {
                setCurrentUser(user);
                setUsers(allUsersData);
                setClients(allClientsData);
                const userPermissions = permissions[user.role] || {};
                const allowedLinks = allLinks.filter(link => userPermissions[link.pageName]);
                setVisibleLinks(allowedLinks);
            } else {
                // User ID in storage but not in DB
                logout();
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            logout();
        } finally {
            setIsLoading(false);
        }
    }, [pathname, router, setCurrentUser, allLinks, logout]);


    useEffect(() => {
        checkAuthStatus();
        
        const events = ['mousemove', 'keydown', 'click', 'scroll'];
        events.forEach(event => window.addEventListener(event, resetInactivityTimer));

        const handleBeforeUnload = () => {
            if (currentUser) {
                 navigator.sendBeacon('/api/logout', JSON.stringify({ userId: currentUser.id }));
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        const handleStorageChange = (event: StorageEvent) => {
             if (event.key === 'loggedInUserId' && event.newValue === null) {
                logout();
            }
        };
        window.addEventListener('storage', handleStorageChange);


        return () => {
            events.forEach(event => window.removeEventListener(event, resetInactivityTimer));
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            clearTimeout(inactivityTimer.current);
        };
    }, []); // Run only once on mount
    
    const contextValue = useMemo(() => ({
        currentUser,
        users,
        clients,
        isLoading,
        visibleLinks,
        setCurrentUser,
        resetInactivityTimer
    }), [currentUser, users, clients, isLoading, visibleLinks, setCurrentUser, resetInactivityTimer]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
