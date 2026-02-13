import { useState, useEffect } from 'react';

const MonCompte = ({ user, onLogout }) => {
    const [profileData, setProfileData] = useState(null);
    const [formData, setFormData] = useState({ nom: '', prenom: '', email: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const colors = {
        primary: '#234666',
        secondary: '#64748B',
        success: '#10B981',
        danger: '#D34053',
        warning: '#F59E0B',
        info: '#3C50E0'
    };

    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/auth/profile', { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setProfileData(data);
                setFormData({ nom: data.nom || '', prenom: data.prenom || '', email: data.email || '' });
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du profil:", error);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setMessage({ text: 'Mise à jour en cours...', type: 'info' });
        
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ text: "✅ Profil mis à jour avec succès !", type: 'success' });
                setIsEditing(false);
                fetchProfile();
            } else {
                setMessage({ text: "❌ Erreur : " + data.message, type: 'danger' });
            }
        } catch (error) {
            setMessage({ text: "❌ Erreur serveur", type: 'danger' });
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setMessage({ text: "❌ Veuillez remplir tous les champs", type: 'danger' });
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ text: "❌ Les mots de passe ne correspondent pas", type: 'danger' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ text: "❌ Le mot de passe doit contenir au moins 6 caractères", type: 'danger' });
            return;
        }

        setMessage({ text: 'Modification en cours...', type: 'info' });
        
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ 
                    currentPassword: passwordData.currentPassword, 
                    newPassword: passwordData.newPassword 
                })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ text: "✅ Mot de passe modifié avec succès !", type: 'success' });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setShowPasswordForm(false);
            } else {
                setMessage({ text: "❌ Erreur : " + data.message, type: 'danger' });
            }
        } catch (error) {
            setMessage({ text: "❌ Erreur serveur", type: 'danger' });
        }
    };

    const getRoleBadge = (role) => {
        const roles = {
            'ADMIN': { bg: '#FEE2E2', color: '#991B1B' },
            'GESTIONNAIRE': { bg: '#DBEAFE', color: '#1D4ED8' },
            'COORDONNATEUR': { bg: '#FEF3C7', color: '#92400E' },
            'ENSEIGNANT': { bg: '#DCFCE7', color: '#166534' },
            'ETUDIANT': { bg: '#E0E7FF', color: '#4338CA' }
        };
        const r = roles[role] || { bg: '#F3F4F6', color: '#374151' };
        return (
            <span style={{ 
                padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                backgroundColor: r.bg, color: r.color 
            }}>
                {role}
            </span>
        );
    };

    const styles = {
        card: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '30px' },
        input: { padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
        button: { padding: '12px 25px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
        label: { display: 'block', fontSize: '12px', color: colors.secondary, fontWeight: 'bold', marginBottom: '8px' }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ margin: 0, color: colors.primary }}>👤 Mon Profil</h2>
                {profileData && getRoleBadge(profileData.role)}
            </div>

            {/* MESSAGE */}
            {message.text && (
                <div style={{ 
                    padding: '15px', borderRadius: '8px', marginBottom: '20px',
                    backgroundColor: message.type === 'success' ? '#DCFCE7' : message.type === 'danger' ? '#FEE2E2' : '#FEF3C7',
                    color: message.type === 'success' ? '#166534' : message.type === 'danger' ? '#991B1B' : '#92400E'
                }}>
                    {message.text}
                </div>
            )}

            {/* INFORMATIONS DU PROFIL */}
            <div style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h3 style={{ margin: 0, color: colors.primary, fontSize: '18px' }}>Informations Personnelles</h3>
                    {!isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)} 
                            style={{ border: 'none', background: 'transparent', color: colors.info, cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                        >
                            ✏️ Modifier
                        </button>
                    )}
                </div>

                {/* Avatar placeholder */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px', paddingBottom: '25px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ 
                        width: '80px', height: '80px', borderRadius: '50%', backgroundColor: colors.primary, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '32px', fontWeight: 'bold' 
                    }}>
                        {profileData?.nom?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: colors.primary }}>
                            {profileData?.nom} {profileData?.prenom}
                        </div>
                        <div style={{ fontSize: '14px', color: colors.secondary }}>{profileData?.email}</div>
                        <div style={{ fontSize: '12px', color: colors.secondary, marginTop: '5px' }}>
                            Membre depuis: {profileData?.date_creation ? new Date(profileData.date_creation).toLocaleDateString('fr-FR') : 'N/A'}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleProfileUpdate}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={styles.label}>NOM</label>
                            <input 
                                type="text" 
                                value={formData.nom} 
                                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                                disabled={!isEditing}
                                style={{ ...styles.input, backgroundColor: isEditing ? 'white' : '#F8FAFC' }}
                            />
                        </div>
                        <div>
                            <label style={styles.label}>PRÉNOM</label>
                            <input 
                                type="text" 
                                value={formData.prenom} 
                                onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                                disabled={!isEditing}
                                style={{ ...styles.input, backgroundColor: isEditing ? 'white' : '#F8FAFC' }}
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: '15px' }}>
                        <label style={styles.label}>EMAIL</label>
                        <input 
                            type="email" 
                            value={formData.email} 
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            disabled={!isEditing}
                            style={{ ...styles.input, backgroundColor: isEditing ? 'white' : '#F8FAFC' }}
                        />
                    </div>

                    {isEditing && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button type="submit" style={styles.button}>Enregistrer</button>
                            <button 
                                type="button" 
                                onClick={() => { 
                                    setIsEditing(false); 
                                    setFormData({ nom: profileData?.nom || '', prenom: profileData?.prenom || '', email: profileData?.email || '' });
                                }} 
                                style={{ ...styles.button, backgroundColor: colors.secondary }}
                            >
                                Annuler
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* SÉCURITÉ - MOT DE PASSE */}
            <div style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: colors.primary, fontSize: '18px' }}>🔐 Sécurité</h3>
                    {!showPasswordForm && (
                        <button 
                            onClick={() => setShowPasswordForm(true)} 
                            style={{ border: 'none', background: 'transparent', color: colors.warning, cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                        >
                            Changer le mot de passe
                        </button>
                    )}
                </div>

                {showPasswordForm ? (
                    <form onSubmit={handlePasswordChange}>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div>
                                <label style={styles.label}>MOT DE PASSE ACTUEL</label>
                                <input 
                                    type="password" 
                                    value={passwordData.currentPassword} 
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    style={styles.input}
                                />
                            </div>
                            <div>
                                <label style={styles.label}>NOUVEAU MOT DE PASSE</label>
                                <input 
                                    type="password" 
                                    value={passwordData.newPassword} 
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    style={styles.input}
                                />
                            </div>
                            <div>
                                <label style={styles.label}>CONFIRMER LE NOUVEAU MOT DE PASSE</label>
                                <input 
                                    type="password" 
                                    value={passwordData.confirmPassword} 
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    style={styles.input}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button type="submit" style={styles.button}>Modifier le mot de passe</button>
                            <button 
                                type="button" 
                                onClick={() => { 
                                    setShowPasswordForm(false); 
                                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                }} 
                                style={{ ...styles.button, backgroundColor: colors.secondary }}
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                ) : (
                    <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '8px', textAlign: 'center' }}>
                        <p style={{ margin: 0, color: colors.secondary }}>Cliquez sur "Changer le mot de passe" pour modifier votre mot de passe.</p>
                    </div>
                )}
            </div>

            {/* DÉCONNEXION */}
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <button 
                    onClick={onLogout} 
                    style={{ 
                        padding: '15px 40px', 
                        background: 'white', 
                        border: '2px solid', 
                        borderColor: colors.danger, 
                        color: colors.danger, 
                        borderRadius: '8px', 
                        cursor: 'pointer', 
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }}
                >
                    🚪 Se déconnecter
                </button>
            </div>
        </div>
    );
};

export default MonCompte;
