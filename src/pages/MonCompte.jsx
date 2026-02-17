import { useState, useEffect } from 'react';
import { apiCall } from '../config/api.js';

const MonCompte = ({ user, onLogout }) => {
    const [profileData, setProfileData] = useState(null);
    const [formData, setFormData] = useState({ nom: '', prenom: '', email: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const fetchProfile = async () => {
        try {
            const res = await apiCall('/api/auth/profile');
            if (res.ok) {
                const data = await res.json();
                setProfileData(data);
                setFormData({ nom: data.nom || '', prenom: data.prenom || '', email: data.email || '' });
            }
        } catch (error) { console.error('Erreur lors de la récupération du profil:', error); }
    };

    useEffect(() => { fetchProfile(); }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setMessage({ text: 'Mise à jour en cours...', type: 'info' });
        try {
            const res = await apiCall('/api/auth/profile', { method: 'PUT', body: JSON.stringify(formData) });
            const data = await res.json();
            if (res.ok) { setMessage({ text: '✅ Profil mis à jour avec succès !', type: 'success' }); setIsEditing(false); fetchProfile(); }
            else setMessage({ text: '❌ Erreur : ' + (data.message || 'Erreur'), type: 'danger' });
        } catch (error) { setMessage({ text: '❌ Erreur serveur', type: 'danger' }); }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) { setMessage({ text: '❌ Veuillez remplir tous les champs', type: 'danger' }); return; }
        if (passwordData.newPassword !== passwordData.confirmPassword) { setMessage({ text: '❌ Les mots de passe ne correspondent pas', type: 'danger' }); return; }
        if (passwordData.newPassword.length < 6) { setMessage({ text: '❌ Le mot de passe doit contenir au moins 6 caractères', type: 'danger' }); return; }
        setMessage({ text: 'Modification en cours...', type: 'info' });
        try {
            const res = await apiCall('/api/auth/change-password', { method: 'PUT', body: JSON.stringify({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }) });
            const data = await res.json();
            if (res.ok) { setMessage({ text: '✅ Mot de passe modifié avec succès !', type: 'success' }); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); setShowPasswordForm(false); }
            else setMessage({ text: '❌ Erreur : ' + (data.message || 'Erreur'), type: 'danger' });
        } catch (error) { setMessage({ text: '❌ Erreur serveur', type: 'danger' }); }
    };

    const roleBadge = (role) => {
        const map = { ADMIN: 'bg-red-100 text-red-700', GESTIONNAIRE: 'bg-blue-100 text-blue-700', COORDONNATEUR: 'bg-yellow-100 text-yellow-700', ENSEIGNANT: 'bg-green-100 text-green-700', ETUDIANT: 'bg-indigo-100 text-indigo-700' };
        return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${map[role] || 'bg-gray-100 text-gray-700'}`}>{role}</span>;
    };

    const inputClass = 'w-full px-3 py-2 border rounded-md';
    const cardClass = 'bg-white rounded-lg shadow p-6 mb-6';

    return (
        <div className="max-w-2xl mx-auto p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">👤 Mon Profil</h2>
                {profileData && roleBadge(profileData.role?.code || profileData.role)}
            </div>

            {message.text && (
                <div className={`${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : message.type === 'danger' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'} border rounded-md p-3 mb-4`}>
                    {message.text}
                </div>
            )}

            <div className={cardClass}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Informations Personnelles</h3>
                    {!isEditing && <button onClick={() => setIsEditing(true)} className="text-blue-600 font-bold">✏️ Modifier</button>}
                </div>

                <div className="flex items-center gap-6 mb-6 border-b pb-6">
                    <div className="w-20 h-20 rounded-full bg-indigo-700 text-white flex items-center justify-center text-3xl font-bold">{profileData?.nom?.charAt(0)?.toUpperCase() || 'U'}</div>
                    <div>
                        <div className="text-lg font-bold text-gray-800">{profileData?.nom} {profileData?.prenom}</div>
                        <div className="text-sm text-gray-500">{profileData?.email}</div>
                    </div>
                </div>

                <form onSubmit={handleProfileUpdate}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">NOM</label>
                            <input type="text" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} disabled={!isEditing} className={`${inputClass} ${isEditing ? '' : 'bg-gray-50'}`} />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">PRÉNOM</label>
                            <input type="text" value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} disabled={!isEditing} className={`${inputClass} ${isEditing ? '' : 'bg-gray-50'}`} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">EMAIL</label>
                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={!isEditing} className={`${inputClass} ${isEditing ? '' : 'bg-gray-50'}`} />
                    </div>

                    {isEditing && (
                        <div className="flex gap-3 mt-4">
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Enregistrer</button>
                            <button type="button" onClick={() => { setIsEditing(false); setFormData({ nom: profileData?.nom || '', prenom: profileData?.prenom || '', email: profileData?.email || '' }); }} className="px-4 py-2 bg-gray-200 rounded-md">Annuler</button>
                        </div>
                    )}
                </form>
            </div>

            <div className={cardClass}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">🔐 Sécurité</h3>
                    {!showPasswordForm && <button onClick={() => setShowPasswordForm(true)} className="text-yellow-600 font-bold">Changer le mot de passe</button>}
                </div>

                {showPasswordForm ? (
                    <form onSubmit={handlePasswordChange}>
                        <div className="grid gap-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block">MOT DE PASSE ACTUEL</label>
                                <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className={inputClass} />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block">NOUVEAU MOT DE PASSE</label>
                                <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className={inputClass} />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block">CONFIRMER LE NOUVEAU MOT DE PASSE</label>
                                <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className={inputClass} />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Modifier le mot de passe</button>
                            <button type="button" onClick={() => { setShowPasswordForm(false); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }} className="px-4 py-2 bg-gray-200 rounded-md">Annuler</button>
                        </div>
                    </form>
                ) : (
                    <div className="p-4 bg-gray-50 rounded text-center">Cliquez sur "Changer le mot de passe" pour modifier votre mot de passe.</div>
                )}
            </div>

            <div className="text-center mt-6">
                <button onClick={onLogout} className="px-6 py-3 bg-white border-2 border-red-600 text-red-600 rounded-md font-bold">🚪 Se déconnecter</button>
            </div>
        </div>
    );
};

export default MonCompte;
