'use client';

import { useState, useEffect, Fragment } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Toast } from '@/components/Toast';

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    name?: string;
    email: string;
    phone?: string;
    isHost: boolean;
    isEmailVerified: boolean;
    lastLogin: string;
    createdAt: string;
    updatedAt: string;
    boatsCount?: number;
    bookingsCount?: number;
    boats?: {
        _id: string;
        name: string;
        type?: string;
        capacity?: number;
        status?: string;
    }[];
    hostProfile?: {
        bio?: string;
        responseTime?: string;
        isSuperHost?: boolean;
        rating?: number;
        reviewCount?: number;
        joinedDate?: string;
        status?: 'pending' | 'approved' | 'denied';
        applicationDate?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        profilePhoto?: string;
        captainLicense?: string;
        personalInfo?: string;
        nauticalExperience?: string;
        languages?: string;
        hostDescription?: string;
        documents?: {
            dniFront?: string;
            dniBack?: string;
        };
        submittedAt?: string;
        processedAt?: string;
        adminNotes?: string;
        rejectionReason?: string;
    };
    hostApplication?: {
        status: 'pending' | 'approved' | 'denied';
        applicationDate: string;
        email: string;
        phone: string;
        motivation: string;
        experience: string;
        documents: {
            dniFront: string;
            dniBack: string;
        };
        submittedAt: string;
        processedAt?: string;
        adminNotes?: string;
        rejectionReason?: string;
    };
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'hosts' | 'guests'>('all');
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });
    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editUser, setEditUser] = useState({
        name: '',
        email: '',
        phone: '',
        isHost: false
    });
    const [savingEdit, setSavingEdit] = useState(false);
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [broadcastAudience, setBroadcastAudience] = useState<'all' | 'hosts' | 'guests'>('all');
    const [broadcastText, setBroadcastText] = useState('');
    const [showChatModal, setShowChatModal] = useState(false);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [chatSendText, setChatSendText] = useState('');
    const [chatUser, setChatUser] = useState<User | null>(null);
    const [chatId, setChatId] = useState<string | null>(null);
    const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>({});
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
        message: '',
        type: 'info',
        isVisible: false,
    });
    const [hostForm, setHostForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        profilePhoto: '',
        captainLicense: '',
        personalInfo: '',
        nauticalExperience: '',
        languages: '',
        hostDescription: '',
        dniFront: '',
        dniBack: ''
    });

    const getUserDisplayName = (user: User | null) =>
        user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || '' : '';

    const normalizeUser = (user: any): User => {
        const composedName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
        const [first = '', ...rest] = composedName.split(' ');
        const last = rest.join(' ').trim();

        return {
            ...user,
            firstName: user.firstName || first,
            lastName: user.lastName || last,
            name: composedName,
            boatsCount: user.boatsCount ?? (Array.isArray(user.boats) ? user.boats.length : 0),
            bookingsCount: user.bookingsCount ?? 0,
            boats: Array.isArray(user.boats) ? user.boats : [],
            lastLogin: user.lastLogin || user.updatedAt || user.createdAt || new Date().toISOString(),
            createdAt: user.createdAt || new Date().toISOString(),
            updatedAt: user.updatedAt || user.createdAt || new Date().toISOString(),
        } as User;
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/admin/users');
                const result = await response.json();

                if (result.success) {
                    // Filtrar usuarios admin y del sistema (por seguridad, aunque el backend ya los filtra)
                    const filteredUsers = result.data.filter((user: any) => 
                        !user.isAdmin && 
                        user.email !== 'admin@barquea.com' && 
                        user.email !== 'system@barquea.com'
                    );
                    setUsers(filteredUsers.map(normalizeUser));
                } else {
                    const mockUsers: any[] = [
                        {
                            _id: '1',
                            name: 'Ana Martínez',
                            email: 'ana@example.com',
                            phone: '+34 600 123 456',
                            isHost: true,
                            isEmailVerified: true,
                            createdAt: '2024-01-15',
                            lastLogin: '2024-01-20',
                            boatsCount: 2,
                            bookingsCount: 15,
                            boats: [
                                {
                                    _id: 'boat1',
                                    name: 'Velero Mediterráneo',
                                    type: 'Sailboat',
                                    capacity: 6,
                                    status: 'available'
                                },
                                {
                                    _id: 'boat2',
                                    name: 'Yate Ejecutivo',
                                    type: 'Yacht',
                                    capacity: 8,
                                    status: 'booked'
                                }
                            ]
                        },
                        {
                            _id: '2',
                            name: 'Carlos López',
                            email: 'carlos@example.com',
                            phone: '+34 600 789 012',
                            isHost: true,
                            isEmailVerified: false,
                            createdAt: '2024-01-10',
                            lastLogin: '2024-01-19',
                            boatsCount: 1,
                            bookingsCount: 8,
                            boats: [
                                {
                                    _id: 'boat3',
                                    name: 'Catamarán Premium',
                                    type: 'Catamaran',
                                    capacity: 12,
                                    status: 'available'
                                }
                            ]
                        },
                        {
                            _id: '3',
                            name: 'María García',
                            email: 'maria@example.com',
                            phone: '+34 600 345 678',
                            isHost: false,
                            isEmailVerified: true,
                            createdAt: '2024-01-12',
                            lastLogin: '2024-01-20',
                            boatsCount: 0,
                            bookingsCount: 5
                        }
                    ];

                    setUsers(mockUsers.map(normalizeUser));
                }
            } catch (error) {
                const mockUsers: any[] = [
                    {
                        _id: '1',
                        name: 'Ana Martínez',
                        email: 'ana@example.com',
                        phone: '+34 600 123 456',
                        isHost: true,
                        isEmailVerified: true,
                        createdAt: '2024-01-15',
                        lastLogin: '2024-01-20',
                        boatsCount: 2,
                        bookingsCount: 15,
                        boats: [
                            {
                                _id: 'boat1',
                                name: 'Velero Mediterráneo',
                                type: 'Sailboat',
                                capacity: 6,
                                status: 'available'
                            },
                            {
                                _id: 'boat2',
                                name: 'Yate Ejecutivo',
                                type: 'Yacht',
                                capacity: 8,
                                status: 'booked'
                            }
                        ]
                    },
                    {
                        _id: '2',
                        name: 'Carlos López',
                        email: 'carlos@example.com',
                        phone: '+34 600 789 012',
                        isHost: true,
                        isEmailVerified: false,
                        createdAt: '2024-01-10',
                        lastLogin: '2024-01-19',
                        boatsCount: 1,
                        bookingsCount: 8,
                        boats: [
                            {
                                _id: 'boat3',
                                name: 'Catamarán Premium',
                                type: 'Catamaran',
                                capacity: 12,
                                status: 'available'
                            }
                        ]
                    },
                    {
                        _id: '3',
                        name: 'María García',
                        email: 'maria@example.com',
                        phone: '+34 600 345 678',
                        isHost: false,
                        isEmailVerified: true,
                        createdAt: '2024-01-08',
                        lastLogin: '2024-01-18',
                        boatsCount: 0,
                        bookingsCount: 12,
                        boats: []
                    },
                    {
                        _id: '4',
                        name: 'Juan Pérez',
                        email: 'juan@example.com',
                        phone: '+34 600 456 789',
                        isHost: false,
                        isEmailVerified: false,
                        createdAt: '2024-01-05',
                        lastLogin: '2024-01-17',
                        boatsCount: 0,
                        bookingsCount: 3,
                        boats: []
                    },
                    {
                        _id: '5',
                        name: 'Roberto Silva',
                        email: 'roberto@example.com',
                        phone: '+58 412 123 4567',
                        isHost: true,
                        isEmailVerified: true,
                        createdAt: '2024-01-12',
                        lastLogin: '2024-01-20',
                        boatsCount: 0,
                        bookingsCount: 5,
                        boats: []
                    }
                ];
                setUsers(mockUsers.map(normalizeUser));
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterType === 'hosts') return matchesSearch && user.isHost;
        if (filterType === 'guests') return matchesSearch && !user.isHost;
        return matchesSearch;
    });

    const handleAddUser = () => {
        const user: User = {
            _id: Date.now().toString(),
            name: `${newUser.firstName} ${newUser.lastName}`,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            phone: newUser.phone,
            isHost: false,
            isEmailVerified: true,
            createdAt: new Date().toISOString().split('T')[0],
            lastLogin: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString(),
            boatsCount: 0,
            bookingsCount: 0
        };
        setUsers([...users, user]);
        setNewUser({ firstName: '', lastName: '', email: '', phone: '' });
        setShowModal(false);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setEditUser({
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone || '',
            isHost: user.isHost
        });
        setHostForm({
            firstName: user.hostProfile?.firstName || user.firstName || '',
            lastName: user.hostProfile?.lastName || user.lastName || '',
            email: user.hostProfile?.email || user.email || '',
            phone: user.hostProfile?.phone || user.phone || '',
            profilePhoto: user.hostProfile?.profilePhoto || '',
            captainLicense: user.hostProfile?.captainLicense || '',
            personalInfo: user.hostProfile?.personalInfo || '',
            nauticalExperience: user.hostProfile?.nauticalExperience || '',
            languages: user.hostProfile?.languages || '',
            hostDescription: user.hostProfile?.hostDescription || '',
            dniFront: user.hostProfile?.documents?.dniFront || '',
            dniBack: user.hostProfile?.documents?.dniBack || ''
        });
        setShowEditModal(true);
    };

    const handleUpdateUser = async () => {
        if (!selectedUser || savingEdit) return;

        setSavingEdit(true);

        const closeModal = () => {
            setSavingEdit(false);
            setShowEditModal(false);
            setSelectedUser(null);
            setEditUser({ name: '', email: '', phone: '', isHost: false });
            setHostForm({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                profilePhoto: '',
                captainLicense: '',
                personalInfo: '',
                nauticalExperience: '',
                languages: '',
                hostDescription: '',
                dniFront: '',
                dniBack: ''
            });
        };

        try {
            const [firstNamePart, ...lastParts] = editUser.name.split(' ');
            const firstName = firstNamePart || selectedUser.firstName;
            const lastName = lastParts.join(' ').trim() || selectedUser.lastName;

            const payload: any = {
                firstName,
                lastName,
                email: editUser.email,
                phone: editUser.phone,
                isHost: editUser.isHost,
            };

            if (editUser.isHost) {
                payload.hostProfile = {
                    firstName: hostForm.firstName || firstName,
                    lastName: hostForm.lastName || lastName,
                    email: hostForm.email || editUser.email,
                    phone: hostForm.phone || editUser.phone,
                    profilePhoto: hostForm.profilePhoto || '',
                    captainLicense: hostForm.captainLicense || '',
                    personalInfo: hostForm.personalInfo || '',
                    nauticalExperience: hostForm.nauticalExperience || '',
                    languages: hostForm.languages || '',
                    hostDescription: hostForm.hostDescription || '',
                    documents: {
                        dniFront: hostForm.dniFront || '',
                        dniBack: hostForm.dniBack || ''
                    },
                    status: 'approved',
                };
            } else {
                payload.hostProfile = {
                    status: 'denied',
                };
            }

            const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.success) {
                const updatedUser: User = result.data;
                setUsers(prev =>
                    prev.map(user =>
                        user._id === updatedUser._id
                            ? {
                                ...user,
                                ...updatedUser,
                            }
                            : user
                    )
                );
            } else {
            }
        } catch (error) {
        } finally {
            closeModal();
        }
    };

    const handleDeleteUser = (user: User) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const confirmDeleteUser = () => {
        if (!selectedUser) return;

        setUsers(prev => prev.filter(user => user._id !== selectedUser._id));
        setShowDeleteModal(false);
        setSelectedUser(null);
    };

    const fetchOrCreateAdminChat = async (userId: string) => {
        const createRes = await fetch('/api/chats/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        const createJson = await createRes.json();
        if (!createJson.success) throw new Error(createJson.error || 'No se pudo crear chat');
        return createJson.data._id;
    };

    const loadChatMessages = async (chat: string, scrollToBottom = false) => {
        try {
            const res = await fetch(`/api/chats/${chat}/messages?limit=100`);
            const json = await res.json();
            if (json.success) {
                setChatMessages(json.data || []);
                // Limpiar contador de no leídos cuando se cargan los mensajes
                if (chatUser) {
                    setUnreadMessages(prev => {
                        const updated = { ...prev };
                        delete updated[chatUser._id];
                        return updated;
                    });
                }
                // Scroll al final después de cargar
                if (scrollToBottom) {
                    setTimeout(() => {
                        const container = document.getElementById('chat-messages-container');
                        if (container) {
                            container.scrollTop = container.scrollHeight;
                        }
                    }, 100);
                }
            } else {
                setChatMessages([]);
            }
        } catch (err) {
            setChatMessages([]);
        } finally {
            setChatLoading(false);
        }
    };

    // Polling cada 1 segundo cuando el chat está abierto
    useEffect(() => {
        if (!showChatModal || !chatId) return;

        // Cargar inmediatamente
        loadChatMessages(chatId, true);

        const interval = setInterval(() => {
            loadChatMessages(chatId, true);
        }, 1000);

        return () => clearInterval(interval);
    }, [showChatModal, chatId, chatUser]);

    // Cargar mensajes no leídos para todos los usuarios
    useEffect(() => {
        if (users.length === 0) return;

        const loadUnreadCounts = async () => {
            try {
                const unreadCounts: Record<string, number> = {};
                // Solo verificar los primeros 50 usuarios para no sobrecargar
                const usersToCheck = users.slice(0, 50);
                await Promise.all(
                    usersToCheck.map(async (user) => {
                        try {
                            const chatRes = await fetch(`/api/chats/admin?userId=${user._id}`);
                            const chatJson = await chatRes.json();
                            if (chatJson.success && chatJson.data?._id) {
                                const messagesRes = await fetch(`/api/chats/${chatJson.data._id}/messages?limit=100`);
                                const messagesJson = await messagesRes.json();
                                if (messagesJson.success && messagesJson.data) {
                                    const unread = messagesJson.data.filter((msg: any) => 
                                        msg.senderRole !== 'admin' && 
                                        (!msg.readBy || !msg.readBy.some((id: string) => id.includes('admin')))
                                    ).length;
                                    if (unread > 0) {
                                        unreadCounts[user._id] = unread;
                                    }
                                }
                            }
                        } catch (err) {
                            // Ignorar errores individuales
                        }
                    })
                );
                setUnreadMessages(unreadCounts);
            } catch (err) {
                // Ignorar errores
            }
        };

        loadUnreadCounts();
        const interval = setInterval(loadUnreadCounts, 10000); // Actualizar cada 10 segundos
        return () => clearInterval(interval);
    }, [users]);

    const openChatModal = async (user: User) => {
        try {
            setChatUser(user);
            const id = await fetchOrCreateAdminChat(user._id);
            setChatId(id);
            await loadChatMessages(id);
            setShowChatModal(true);
        } catch (err) {
            alert('No se pudo abrir el chat');
        }
    };

    const sendChatMessage = async () => {
        if (!chatId || !chatUser || !chatSendText.trim()) return;
        try {
            const res = await fetch(`/api/admin/messages/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: chatUser._id, text: chatSendText.trim() }),
            });
            const json = await res.json();
            if (!json.success) {
                alert(json.error || 'No se pudo enviar');
                return;
            }
            setChatSendText('');
            await loadChatMessages(chatId, true);
        } catch (err) {
            alert('No se pudo enviar');
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                
                <div className="flex justify-between items-center flex-wrap gap-3">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
                        <p className="text-gray-800">Gestiona los usuarios registrados en la plataforma</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowBroadcastModal(true)}
                            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405M15 7h5l-1.405 1.405M9 5v14M5 5v14" />
                            </svg>
                            Mensaje broadcast
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                            Nuevo Usuario
                        </button>
                    </div>
                </div>

                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Buscar usuarios..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-600"
                            />
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setFilterType('all')}
                                className={`px-4 py-2 rounded-lg ${filterType === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setFilterType('hosts')}
                                className={`px-4 py-2 rounded-lg ${filterType === 'hosts'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Hosts
                            </button>
                            <button
                                onClick={() => setFilterType('guests')}
                                className={`px-4 py-2 rounded-lg ${filterType === 'guests'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Huéspedes
                            </button>
                        </div>
                    </div>
                </div>

                
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Usuario
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Barcos
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Reservas
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Último acceso
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <Fragment key={user._id}>
                                        <tr
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => {
                                                if (user.isHost && user.boats && user.boats.length > 0) {
                                                    setExpandedUser(expandedUser === user._id ? null : user._id);
                                                }
                                            }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-blue-600 font-medium">
                                                            {`${user.firstName[0]}${user.lastName[0]}`}
                                                        </span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{`${user.firstName} ${user.lastName}`}</div>
                                                        <div className="text-sm text-gray-700">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isHost
                                                    ? 'bg-green-100 text-green-800'
                                                    : user.hostApplication?.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : user.hostApplication?.status === 'denied'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {user.isHost
                                                        ? 'Host'
                                                        : user.hostApplication?.status === 'pending'
                                                            ? 'Aplicando Host'
                                                            : user.hostApplication?.status === 'denied'
                                                                ? 'Host Denegado'
                                                                : 'Huésped'
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isEmailVerified
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {user.isEmailVerified ? 'Verificado' : 'Pendiente'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.boatsCount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.bookingsCount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Nunca'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditUser(user);
                                                        }}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            await openChatModal(user);
                                                        }}
                                                        className="relative text-blue-600 hover:text-blue-900 p-1"
                                                        title="Enviar mensaje"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                        </svg>
                                                        {unreadMessages[user._id] > 0 && (
                                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                                {unreadMessages[user._id] > 9 ? '9+' : unreadMessages[user._id]}
                                                            </span>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteUser(user);
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Eliminar
                                                    </button>
                                                    {user.isHost && user.boats && user.boats.length > 0 && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setExpandedUser(expandedUser === user._id ? null : user._id);
                                                            }}
                                                            className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 text-sm"
                                                        >
                                                            {expandedUser === user._id ? 'Ocultar barcos' : 'Ver barcos'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>

                                        
                                        {expandedUser === user._id && user.isHost && user.boats && user.boats.length > 0 && (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-4 bg-gray-50">
                                                    <div className="space-y-3">
                                                        <h4 className="font-medium text-gray-900">Barcos del Host</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {user.boats.map((boat) => (
                                                                <div key={boat._id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <h5 className="font-medium text-gray-900">{boat.name}</h5>
                                                                        <span className={`px-2 py-1 text-xs rounded-full ${boat.status === 'available' ? 'bg-green-100 text-green-800' :
                                                                            boat.status === 'booked' ? 'bg-red-100 text-red-800' :
                                                                                'bg-yellow-100 text-yellow-800'
                                                                            }`}>
                                                                            {boat.status === 'available' ? 'Disponible' :
                                                                                boat.status === 'booked' ? 'Reservado' : 'Mantenimiento'}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-gray-800">{boat.type}</p>
                                                                    <p className="text-sm text-gray-700">Capacidad: {boat.capacity} personas</p>
                                                                    <div className="mt-3">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                window.location.href = `/admin/boats/${boat._id}`;
                                                                            }}
                                                                            className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                                                        >
                                                                            Ver Barco
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Mostrando {filteredUsers.length} de {users.length} usuarios
                    </div>
                    <div className="flex space-x-2">
                        <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700">
                            Anterior
                        </button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded-md">
                            1
                        </button>
                        <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700">
                            Siguiente
                        </button>
                    </div>
                </div>

                
                {showModal && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Nuevo Usuario</h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-800"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        value={newUser.firstName}
                                        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="Nombre"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Apellidos
                                    </label>
                                    <input
                                        type="text"
                                        value={newUser.lastName}
                                        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="Apellidos"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="Email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        value={newUser.phone}
                                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="Teléfono"
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleAddUser}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Crear Usuario
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                
                {showEditModal && selectedUser && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Editar Usuario</h3>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="text-gray-400 hover:text-gray-800"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre completo
                                    </label>
                                    <input
                                        type="text"
                                        value={editUser.name}
                                        onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="Nombre completo"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={editUser.email}
                                        onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="Email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        value={editUser.phone}
                                        onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="Teléfono"
                                    />
                                </div>

                                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 bg-gray-50">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Host</p>
                                        <p className="text-xs text-gray-600">Activa o desactiva acceso como host</p>
                                    </div>
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editUser.isHost}
                                            onChange={(e) => setEditUser({ ...editUser, isHost: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative transition-colors">
                                            <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5 shadow" />
                                        </div>
                                        <span className="ml-3 text-sm text-gray-800">{editUser.isHost ? 'Sí' : 'No'}</span>
                                    </label>
                                </div>

                                {editUser.isHost && (
                                    <div className="space-y-4 border-t border-gray-200 pt-4 mt-2">
                                        <h4 className="text-base font-semibold text-gray-800">Datos de Host</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                                <input
                                                    type="text"
                                                    value={hostForm.firstName}
                                                    onChange={(e) => setHostForm({ ...hostForm, firstName: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                                    placeholder="Nombre"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                                                <input
                                                    type="text"
                                                    value={hostForm.lastName}
                                                    onChange={(e) => setHostForm({ ...hostForm, lastName: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                                    placeholder="Apellidos"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                <input
                                                    type="email"
                                                    value={hostForm.email}
                                                    onChange={(e) => setHostForm({ ...hostForm, email: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                                    placeholder="Email"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                                <input
                                                    type="tel"
                                                    value={hostForm.phone}
                                                    onChange={(e) => setHostForm({ ...hostForm, phone: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                                    placeholder="Teléfono"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Licencia de capitán</label>
                                                <input
                                                    type="text"
                                                    value={hostForm.captainLicense}
                                                    onChange={(e) => setHostForm({ ...hostForm, captainLicense: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                                    placeholder="Número o identificador"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Idiomas</label>
                                                <input
                                                    type="text"
                                                    value={hostForm.languages}
                                                    onChange={(e) => setHostForm({ ...hostForm, languages: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                                    placeholder="Español, Inglés..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Foto de perfil (URL)</label>
                                                <input
                                                    type="text"
                                                    value={hostForm.profilePhoto}
                                                    onChange={(e) => setHostForm({ ...hostForm, profilePhoto: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">DNI frontal (URL)</label>
                                                <input
                                                    type="text"
                                                    value={hostForm.dniFront}
                                                    onChange={(e) => setHostForm({ ...hostForm, dniFront: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">DNI reverso (URL)</label>
                                                <input
                                                    type="text"
                                                    value={hostForm.dniBack}
                                                    onChange={(e) => setHostForm({ ...hostForm, dniBack: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Información personal</label>
                                                <textarea
                                                    value={hostForm.personalInfo}
                                                    onChange={(e) => setHostForm({ ...hostForm, personalInfo: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                                    rows={2}
                                                    placeholder="Breve descripción personal"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Experiencia náutica</label>
                                                <textarea
                                                    value={hostForm.nauticalExperience}
                                                    onChange={(e) => setHostForm({ ...hostForm, nauticalExperience: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                                    rows={2}
                                                    placeholder="Años de experiencia, tipos de barcos, etc."
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción como host</label>
                                                <textarea
                                                    value={hostForm.hostDescription}
                                                    onChange={(e) => setHostForm({ ...hostForm, hostDescription: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                                    rows={2}
                                                    placeholder="Cómo atenderás a los huéspedes"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleUpdateUser}
                                        disabled={savingEdit}
                                        className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${savingEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    >
                                        {savingEdit ? 'Guardando...' : 'Actualizar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                
                {showDeleteModal && selectedUser && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="text-gray-400 hover:text-gray-800"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-800 mb-4">
                                    ¿Estás seguro de que quieres eliminar al usuario <strong>{getUserDisplayName(selectedUser)}</strong>?
                                </p>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">
                                                Esta acción no se puede deshacer
                                            </h3>
                                            <div className="mt-2 text-sm text-red-700">
                                                <p>Se eliminarán todos los datos del usuario, incluyendo:</p>
                                                <ul className="list-disc list-inside mt-1">
                                                    <li>Perfil y datos personales</li>
                                                    <li>Barcos asociados (si es host)</li>
                                                    <li>Historial de reservas</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDeleteUser}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Eliminar Usuario
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                
                {showBroadcastModal && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-white/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Mensaje broadcast</h3>
                                    <p className="text-sm text-gray-600">Envia un mensaje a una audiencia</p>
                                </div>
                                <button
                                    onClick={() => setShowBroadcastModal(false)}
                                    className="text-gray-400 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Audiencia</label>
                                    <div className="flex gap-2">
                                        {[
                                            { id: 'all', label: 'Todos' },
                                            { id: 'hosts', label: 'Anfitriones' },
                                            { id: 'guests', label: 'Huéspedes' },
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setBroadcastAudience(opt.id as any)}
                                                className={`px-3 py-2 rounded-lg text-sm border ${broadcastAudience === opt.id
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                                    <textarea
                                        value={broadcastText}
                                        onChange={(e) => setBroadcastText(e.target.value)}
                                        rows={5}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="Escribe el mensaje a enviar"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        onClick={() => setShowBroadcastModal(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (!broadcastText.trim()) {
                                                alert('Escribe un mensaje');
                                                return;
                                            }
                                            try {
                                                const res = await fetch('/api/admin/messages/broadcast', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ audience: broadcastAudience, text: broadcastText }),
                                                });
                                                const result = await res.json();
                                                if (!result.success) {
                                                    setToast({
                                                        message: result.error || 'Error al enviar broadcast',
                                                        type: 'error',
                                                        isVisible: true,
                                                    });
                                                } else {
                                                    setToast({
                                                        message: `Enviado a ${result.data.sentTo} usuarios`,
                                                        type: 'success',
                                                        isVisible: true,
                                                    });
                                                    setShowBroadcastModal(false);
                                                    setBroadcastText('');
                                                }
                                            } catch (err) {
                                                setToast({
                                                    message: 'Error enviando broadcast',
                                                    type: 'error',
                                                    isVisible: true,
                                                });
                                            }
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Enviar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                
                {showChatModal && chatUser && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-white/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Chat con {chatUser.firstName} {chatUser.lastName}</h3>
                                    <p className="text-sm text-gray-600">{chatUser.email}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowChatModal(false);
                                        setChatMessages([]);
                                        setChatSendText('');
                                    }}
                                    className="text-gray-400 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto border border-gray-100 rounded-lg p-3 bg-gray-50" id="chat-messages-container">
                                {chatLoading ? (
                                    <div className="flex justify-center py-10 text-gray-500">Cargando...</div>
                                ) : chatMessages.length === 0 ? (
                                    <div className="flex justify-center py-10 text-gray-500">Sin mensajes</div>
                                ) : (
                                    <div className="space-y-3">
                                        {chatMessages.map((msg: any) => (
                                            <div
                                                key={msg._id}
                                                className={`max-w-[80%] px-3 py-2 rounded-lg ${msg.senderRole === 'admin'
                                                    ? 'bg-blue-600 text-white ml-auto'
                                                    : 'bg-white text-gray-800 border border-gray-200'
                                                    }`}
                                            >
                                                <div className="text-xs opacity-80 mb-1">
                                                    {msg.senderRole === 'admin' ? 'Admin' : 'Usuario'}
                                                </div>
                                                <div className="text-sm whitespace-pre-wrap">{msg.content || msg.text}</div>
                                                <div className="text-[10px] opacity-60 mt-1">
                                                    {new Date(msg.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-3 flex gap-2">
                                <input
                                    type="text"
                                    value={chatSendText}
                                    onChange={(e) => setChatSendText(e.target.value)}
                                    placeholder="Escribe un mensaje"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            sendChatMessage();
                                        }
                                    }}
                                />
                                <button
                                    onClick={sendChatMessage}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Enviar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />
        </AdminLayout>
    );
}
