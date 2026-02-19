'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let isMounted = true;

        const checkAuth = async () => {
            const currentPath = window.location.pathname;

            if (currentPath === '/login') {
                setIsChecking(false);
                setIsAuthenticated(false);
                return;
            }

            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const userData = localStorage.getItem('admin_user') || sessionStorage.getItem('admin_user');

            if (!token || !userData) {
                if (isMounted && currentPath !== '/login') {
                    window.location.href = '/login';
                }
                setIsChecking(false);
                return;
            }

            try {
                const userObj = JSON.parse(userData);
                if (!userObj.isAdmin) {
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('admin_user');
                    sessionStorage.removeItem('admin_token');
                    sessionStorage.removeItem('admin_user');
                    if (isMounted && currentPath !== '/login') {
                        window.location.href = '/login';
                    }
                    setIsChecking(false);
                    return;
                }

                const response = await fetch('/api/auth/verify', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('admin_user');
                    sessionStorage.removeItem('admin_token');
                    sessionStorage.removeItem('admin_user');
                    if (isMounted && currentPath !== '/login') {
                        window.location.href = '/login';
                    }
                    setIsChecking(false);
                    return;
                }

                const data = await response.json();
                if (isMounted) {
                    const isAdmin = data.user?.isAdmin === true || data.user?.isAdmin === 'true';
                    if (data.user && isAdmin) {
                        setUser(data.user);
                        setIsAuthenticated(true);
                        setIsChecking(false);
                    } else {
                        setIsChecking(false);
                        if (currentPath !== '/login') {
                            window.location.href = '/login';
                        }
                    }
                }
            } catch (error) {
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
                sessionStorage.removeItem('admin_token');
                sessionStorage.removeItem('admin_user');
                if (isMounted && currentPath !== '/login') {
                    window.location.href = '/login';
                }
            } finally {
                if (isMounted) {
                    setIsChecking(false);
                }
            }
        };

        checkAuth();

        return () => {
            isMounted = false;
        };
    }, [pathname]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const menuItems = [
        {
            title: 'Dashboard',
            href: '/',
        },
        {
            title: 'Usuarios',
            href: '/admin/users',
        },
        {
            title: 'Aplicaciones Host',
            href: '/admin/host-applications',
        },
        {
            title: 'Barcos',
            href: '/admin/boats',
        },
        {
            title: 'Ubicaciones',
            href: '/admin/locations',
        },
        {
            title: 'Mensajes',
            href: '/admin/messages',
        }
    ];

    const handleLogout = async (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();

        try {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            sessionStorage.removeItem('admin_token');
            sessionStorage.removeItem('admin_user');

            setUserMenuOpen(false);
            setIsAuthenticated(false);
            setUser(null);

            window.location.href = '/login';
        } catch (error) {
            window.location.href = '/login';
        }
    };

    if (isChecking) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Verificando autenticación...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="bg-white shadow-sm border-b border-gray-200 w-full">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 flex items-center">
                                <div className="w-8 h-8 mr-3">
                                    <Image
                                        src="/logo.png"
                                        alt="Barquea Logo"
                                        width={32}
                                        height={32}
                                        className="rounded-lg"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Barquea</h1>
                                    <p className="text-xs text-gray-500">Admin Panel</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50"
                                >
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">A</span>
                                    </div>
                                    <div className="hidden sm:block">
                                        <div className="text-sm font-medium text-gray-900">
                                            {user ? `${user.firstName} ${user.lastName}` : 'Administrador'}
                                        </div>
                                        <div className="text-xs text-gray-500">{user?.email || 'admin@barquea.com'}</div>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">
                                                {user ? `${user.firstName} ${user.lastName}` : 'Administrador'}
                                            </p>
                                            <p className="text-xs text-gray-500">{user?.email || 'admin@barquea.com'}</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Cerrar sesión
                                        </button>
                                    </div>
                                )}
                            </div>


                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 rounded-md hover:bg-gray-100"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 bg-white">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`block px-3 py-2 rounded-md text-base font-medium ${isActive
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.title}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </nav>

            <div className="flex flex-1">
                <div className="hidden md:flex w-64 bg-white shadow-sm border-r border-gray-200 flex-col py-4">
                    <nav className="flex-1 px-4 space-y-2">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;