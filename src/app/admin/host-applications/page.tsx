'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface HostApplication {
    _id: string;
    name: string;
    email: string;
    status: 'pending' | 'approved' | 'denied';
    applicationDate: string;
    submittedAt: string;
    captainLicense: string;
    phone: string;
    nauticalExperience: string;
    languages: string;
    hostDescription: string;
    personalInfo: string;
    profilePhoto: string;
    documents: {
        dniFront: string;
        dniBack: string;
    };
    rejectionReason?: string;
    createdAt: string;
}

export default function HostApplicationsPage() {
    const [applications, setApplications] = useState<HostApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'pending' | 'denied'>('pending');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<HostApplication | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showChatModal, setShowChatModal] = useState(false);
    const [chatUser, setChatUser] = useState<{ id: string; name: string; email: string } | null>(null);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [chatSendText, setChatSendText] = useState('');

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await fetch('/api/host-applications');
                const result = await response.json();

                if (result.success) {
                    setApplications(result.data);
                } else {
                    setApplications([]);
                }
            } catch (error) {
                setApplications([]);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const filteredApplications = applications.filter(app => app.status === filterStatus);

    const handleApprove = async (applicationId: string) => {
        try {
            const response = await fetch('/api/admin/users/approve-host', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: applicationId }),
            });

            const result = await response.json();

            if (result.success) {
                setApplications(prev => prev.map(app =>
                    app._id === applicationId
                        ? { ...app, status: 'approved' as const }
                        : app
                ));
            } else {
            }
        } catch (error) {
        }
    };

    const handleReject = async () => {
        if (!selectedApplication || !rejectionReason.trim()) return;

        try {
            const response = await fetch('/api/admin/users/reject-host', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: selectedApplication._id,
                    reason: rejectionReason
                }),
            });

            const result = await response.json();

            if (result.success) {
                setApplications(prev => prev.map(app =>
                    app._id === selectedApplication._id
                        ? { ...app, status: 'denied' as const, rejectionReason }
                        : app
                ));
            } else {
            }
        } catch (error) {
        }

        setShowRejectModal(false);
        setSelectedApplication(null);
        setRejectionReason('');
    };

    const loadChatMessages = async (userId: string) => {
        try {
            setChatLoading(true);
            const res = await fetch(`/api/chats?userId=${userId}&admin=true`);
            const json = await res.json();
            if (json.success && json.data.length > 0) {
                const chat = json.data[0];
                const messagesRes = await fetch(`/api/chats/${chat._id}/messages`);
                const messagesJson = await messagesRes.json();
                if (messagesJson.success) {
                    setChatMessages(messagesJson.data);
                }
            } else {
                setChatMessages([]);
            }
        } catch (error) {
        } finally {
            setChatLoading(false);
        }
    };

    const sendChatMessage = async () => {
        if (!chatUser || !chatSendText.trim()) return;
        try {
            const res = await fetch(`/api/admin/messages/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: chatUser.id,
                    text: chatSendText.trim(),
                }),
            });
            const json = await res.json();
            if (json.success) {
                setChatSendText('');
                await loadChatMessages(chatUser.id);
            } else {
                alert(json.error || 'No se pudo enviar');
            }
        } catch (error) {
            alert('No se pudo enviar');
        }
    };

    const handleReapprove = (applicationId: string) => {
        setApplications(prev => prev.map(app =>
            app._id === applicationId
                ? { ...app, status: 'approved' as const }
                : app
        ));
    };

    const handleApproveApplication = async (application: HostApplication) => {
        try {
            const response = await fetch('/api/admin/users/approve-host', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: application._id }),
            });

            const result = await response.json();

            if (result.success) {
                setApplications(applications.filter(app => app._id !== application._id));
                
            } else {
            }
        } catch (error) {
        }
    };

    const handleRejectApplication = async () => {
        if (selectedApplication && rejectionReason.trim()) {
            try {
                const response = await fetch('/api/admin/users/reject-host', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: selectedApplication._id,
                        reason: rejectionReason
                    }),
                });

                const result = await response.json();

                if (result.success) {
                    setApplications(applications.map(app =>
                        app._id === selectedApplication._id
                            ? { ...app, status: 'denied', rejectionReason }
                            : app
                    ));
                    
                } else {
                }
            } catch (error) {
            }

            setShowRejectModal(false);
            setSelectedApplication(null);
            setRejectionReason('');
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
                
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Aplicaciones de Host</h1>
                        <p className="text-gray-800">Revisa y aprueba las solicitudes para ser host</p>
                    </div>
                </div>

                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <span className="text-2xl">⏳</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-700">Pendientes</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {applications.filter(app => app.status === 'pending').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <span className="text-2xl">❌</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-700">Denegadas</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {applications.filter(app => app.status === 'denied').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilterStatus('pending')}
                            className={`px-4 py-2 rounded-lg ${filterStatus === 'pending'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Pendientes ({applications.filter(app => app.status === 'pending').length})
                        </button>
                        <button
                            onClick={() => setFilterStatus('denied')}
                            className={`px-4 py-2 rounded-lg ${filterStatus === 'denied'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Denegadas ({applications.filter(app => app.status === 'denied').length})
                        </button>
                    </div>
                </div>

                
                <div className="space-y-4">
                    {filteredApplications.map((application) => (
                        <div key={application._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 font-bold text-lg">
                                                    {application.name.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{application.name}</h3>
                                                <p className="text-gray-800">{application.email}</p>
                                                <p className="text-sm text-gray-700">{application.phone}</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-2">Licencia de Capitán</h4>
                                                <p className="text-sm text-gray-800">{application.captainLicense}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-2">Experiencia Náutica</h4>
                                                <p className="text-sm text-gray-800">{application.nauticalExperience}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-2">Idiomas</h4>
                                                <p className="text-sm text-gray-800">{application.languages}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-2">Descripción como Capitán</h4>
                                                <p className="text-sm text-gray-800">{application.hostDescription}</p>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <h4 className="font-medium text-gray-900 mb-2">Información Personal</h4>
                                            <p className="text-sm text-gray-800">{application.personalInfo}</p>
                                        </div>

                                        <div className="mt-4">
                                            <h4 className="font-medium text-gray-900 mb-2">Documentos</h4>
                                            <div className="flex space-x-4">
                                                <a href={application.documents.dniFront} target="_blank" className="text-blue-600 hover:text-blue-800 text-sm">
                                                    📄 DNI Anverso
                                                </a>
                                                <a href={application.documents.dniBack} target="_blank" className="text-blue-600 hover:text-blue-800 text-sm">
                                                    📄 DNI Reverso
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-2">
                                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${application.status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : application.status === 'approved'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {application.status === 'pending' ? 'Pendiente' :
                                                application.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                                        </span>

                                        {(application.status === 'pending' || application.status === 'denied') && (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={async () => {
                                                        setChatUser({
                                                            id: application._id,
                                                            name: application.name,
                                                            email: application.email,
                                                        });
                                                        setShowChatModal(true);
                                                        await loadChatMessages(application._id);
                                                    }}
                                                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1"
                                                    title="Abrir chat"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                    Mensaje
                                                </button>
                                            </div>
                                        )}

                                        {application.status === 'pending' && (
                                            <div className="flex space-x-2 mt-2">
                                                <button
                                                    onClick={() => handleApproveApplication(application)}
                                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                                                >
                                                    Aprobar
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedApplication(application);
                                                        setShowRejectModal(true);
                                                    }}
                                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                                                >
                                                    Rechazar
                                                </button>
                                            </div>
                                        )}

                                        {application.status === 'rejected' && (
                                            <div className="flex space-x-2 mt-2">
                                                <button
                                                    onClick={() => handleReapprove(application._id)}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                                                >
                                                    Aprobar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredApplications.length === 0 && (
                        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                            <div className="text-gray-400 text-6xl mb-4">📋</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {filterStatus === 'pending' ? 'No hay aplicaciones pendientes' : 'No hay aplicaciones rechazadas'}
                            </h3>
                            <p className="text-gray-700">
                                {filterStatus === 'pending'
                                    ? 'Todas las aplicaciones han sido procesadas'
                                    : 'No hay aplicaciones rechazadas en este momento'
                                }
                            </p>
                        </div>
                    )}
                </div>

                
                {showRejectModal && selectedApplication && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Rechazar Aplicación</h3>
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    className="text-gray-400 hover:text-gray-800"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-800 mb-2">
                                    Aplicación de: <strong>{selectedApplication.name}</strong>
                                </p>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Motivo del rechazo *
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                                    rows={4}
                                    placeholder="Explica el motivo del rechazo. Este mensaje será visible para el usuario..."
                                    required
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={!rejectionReason.trim()}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Rechazar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                
                {showChatModal && chatUser && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-white/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 flex flex-col">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-sm">
                                        {chatUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {chatUser.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">{chatUser.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowChatModal(false);
                                        setChatUser(null);
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

                            <div className="flex-1 overflow-y-auto border border-gray-100 rounded-lg p-4 bg-gray-50">
                                {chatLoading ? (
                                    <div className="flex justify-center py-10 text-gray-500">Cargando...</div>
                                ) : chatMessages.length === 0 ? (
                                    <div className="flex justify-center py-10 text-gray-500">Sin mensajes</div>
                                ) : (
                                    <div className="space-y-4">
                                        {chatMessages.map((msg: any) => {
                                            const isAdmin = msg.senderRole === 'admin' || msg.senderRole === 'system';
                                            return (
                                                <div
                                                    key={msg._id}
                                                    className={`flex items-end gap-2 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}
                                                >
                                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isAdmin
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-400 text-white'
                                                        }`}>
                                                        {isAdmin ? (
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                                            </svg>
                                                        ) : (
                                                            <span>{chatUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</span>
                                                        )}
                                                    </div>
                                                    <div className={`max-w-[75%] ${isAdmin ? 'items-end' : 'items-start'} flex flex-col`}>
                                                        <div className={`px-4 py-3 rounded-2xl shadow-sm ${isAdmin
                                                            ? 'bg-blue-600 text-white rounded-br-sm'
                                                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                                                            }`}>
                                                            <div className={`text-xs font-semibold mb-1.5 ${isAdmin ? 'text-blue-100' : 'text-gray-600'
                                                                }`}>
                                                                {isAdmin ? 'Barquea' : chatUser.name}
                                                            </div>
                                                            <div className={`text-sm whitespace-pre-wrap leading-relaxed ${isAdmin ? 'text-white' : 'text-gray-800'
                                                                }`}>
                                                                {msg.content}
                                                            </div>
                                                            <div className={`text-[10px] mt-2 ${isAdmin ? 'text-blue-100' : 'text-gray-500'
                                                                }`}>
                                                                {new Date(msg.createdAt).toLocaleTimeString('es-ES', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
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
        </AdminLayout>
    );
}
