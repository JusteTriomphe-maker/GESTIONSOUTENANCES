import { useState, useEffect } from 'react';

const Enseignants = () => {
    const [formData, setFormData] = useState({ matricule: '', nom: '', prenom: '', email: '', grade: 'MCF', specialite: '', capacite: 5 });
    const [editData, setEditData] = useState(null);
    const [enseignants, setEnseignants] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDesactivated, setShowDesactivated] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Couleurs du thème harmonisé
    const colors = {
        primary: '#234666',
        secondary: '#64748B',
        success: '#10B981',
        danger: '#D34053',
        bg: '#F8FAFC',
        warning: '#F59E0B'
    };

    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    const fetchEnseignants = async () => {
        try {
            const res = await fetch('/api/enseignants', { headers: getAuthHeaders() });
            const data = await res.json();
            setEnseignants(data);
        } catch (error) {
            console.error("Erreur lors de la récupération:", error);
        }
    };

    useEffect(() => { fetchEnseignants(); }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: "Chargement...", type: 'info' });
        try {
            const res = await fetch('/api/enseignants/add', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage({ text: "✅ Enseignant ajouté avec succès !", type: 'success' });
                setFormData({ matricule: '', nom: '', prenom: '', email: '', grade: 'MCF', specialite: '', capacite: 5 });
                fetchEnseignants();
            } else {
                setMessage({ text: "❌ Erreur : " + data.message, type: 'danger' });
            }
        } catch (error) {
            setMessage({ text: "❌ Erreur serveur", type: 'danger' });
        }
    };

    const handleEdit = (ens) => {
        setEditData({ ...ens });
        setShowModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage({ text: 'Modification en cours...', type: 'info' });
        try {
            const res = await fetch(`/api/enseignants/update/${editData.id_enseignant}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(editData)
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage({ text: "✅ Enseignant modifié avec succès !", type: 'success' });
                setShowModal(false);
                setEditData(null);
                fetchEnseignants();
            } else {
                setMessage({ text: "❌ Erreur : " + data.message, type: 'danger' });
            }
        } catch (error) {
            setMessage({ text: "❌ Erreur serveur", type: 'danger' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet enseignant ? Cette action est irréversible.")) return;
        
        try {
            const res = await fetch(`/api/enseignants/delete/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage({ text: "✅ Enseignant supprimé avec succès !", type: 'success' });
                fetchEnseignants();
            } else {
                setMessage({ text: "❌ Erreur : " + data.message, type: 'danger' });
            }
        } catch (error) {
            setMessage({ text: "❌ Erreur serveur", type: 'danger' });
        }
    };

    const handleDesactivate = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir désactiver cet enseignant ?")) return;
        
        try {
            const res = await fetch(`/api/enseignants/desactivate/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage({ text: "✅ Enseignant désactivé avec succès !", type: 'success' });
                fetchEnseignants();
            } else {
                setMessage({ text: "❌ Erreur : " + data.message, type: 'danger' });
            }
        } catch (error) {
            setMessage({ text: "❌ Erreur serveur", type: 'danger' });
        }
    };

    const handleActivate = async (id) => {
        try {
            const res = await fetch(`/api/enseignants/activate/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage({ text: "✅ Enseignant réactivé avec succès !", type: 'success' });
                fetchEnseignants();
            } else {
                setMessage({ text: "❌ Erreur : " + data.message, type: 'danger' });
            }
        } catch (error) {
            setMessage({ text: "❌ Erreur serveur", type: 'danger' });
        }
    };

    const filteredEnseignants = enseignants.filter(ens => {
        if (showDesactivated) {
            return ens.statut_enseignant === 'Inactif';
        }
        return ens.statut_enseignant !== 'Inactif';
    }).filter(ens => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return ens.matricule?.toLowerCase().includes(search) || 
               ens.nom?.toLowerCase().includes(search) || 
               ens.prenom?.toLowerCase().includes(search) ||
               ens.specialite?.toLowerCase().includes(search) ||
               ens.grade?.toLowerCase().includes(search);
    });

    // Style pour les badges de grade
    const getGradeBadge = (grade) => {
        const badges = {
            'Professeur': { bg: '#EBF5FF', color: '#1E40AF' },
            'MCF': { bg: '#FEF3C7', color: '#92400E' },
            'Assistant': { bg: '#F3F4F6', color: '#374151' }
        };
        const style = badges[grade] || badges['Assistant'];
        return (
            <span style={{ 
                padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                backgroundColor: style.bg, color: style.color 
            }}>{grade}</span>
        );
    };

    const getStatutBadge = (statut) => {
        const isActive = statut === 'Actif';
        return (
            <span style={{ 
                padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                backgroundColor: isActive ? '#DCFCE7' : '#FEE2E2', 
                color: isActive ? '#166534' : '#991B1B' 
            }}>{statut || 'Actif'}</span>
        );
    };

    const styles = {
        card: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '30px' },
        input: { padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
        button: { padding: '12px 25px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: '0.3s' },
        th: { padding: '15px', textAlign: 'left', borderBottom: '2px solid #F1F5F9', color: colors.secondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' },
        td: { padding: '15px', borderBottom: '1px solid #F1F5F9', fontSize: '14px', color: '#334155' },
        searchInput: { padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', width: '300px' },
        actionBtn: { padding: '8px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginRight: '5px' }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ margin: 0, color: colors.primary }}>👨‍🏫 Gestion des Enseignants</h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button 
                        onClick={() => setShowDesactivated(!showDesactivated)}
                        style={{ 
                            ...styles.actionBtn, 
                            backgroundColor: showDesactivated ? colors.danger : '#F1F5F9',
                            color: showDesactivated ? 'white' : colors.secondary
                        }}
                    >
                        {showDesactivated ? '👁️ Voir Actifs' : '🚫 Voir Désactivés'}
                    </button>
                    <span style={{ fontSize: '14px', color: colors.secondary }}>{filteredEnseignants.length} enregistrés</span>
                </div>
            </div>

            {/* RECHERCHE */}
            <div style={{ marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="🔍 Rechercher par matricule, nom, prénom, spécialité ou grade..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />
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

            {/* FORMULAIRE D'AJOUT */}
            {!showDesactivated && (
                <div style={styles.card}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px', color: colors.primary }}>➕ Nouvel Enseignant</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                            <input name="matricule" placeholder="Matricule *" onChange={handleChange} value={formData.matricule} required style={styles.input} />
                            <input name="email" type="email" placeholder="Email professionnel *" onChange={handleChange} value={formData.email} required style={styles.input} />
                            <input name="nom" placeholder="Nom *" onChange={handleChange} value={formData.nom} required style={styles.input} />
                            <input name="prenom" placeholder="Prénom *" onChange={handleChange} value={formData.prenom} required style={styles.input} />
                            
                            <select name="grade" onChange={handleChange} value={formData.grade} style={styles.input}>
                                <option value="Professeur">Professeur</option>
                                <option value="MCF">Maître de Conférences</option>
                                <option value="Assistant">Assistant</option>
                            </select>

                            <select name="capacite" onChange={handleChange} value={formData.capacite} style={styles.input}>
                                <option value="3">Quota : 3 étudiants</option>
                                <option value="5">Quota : 5 étudiants</option>
                                <option value="10">Quota : 10 étudiants</option>
                            </select>
                            
                            <input name="specialite" placeholder="Spécialité (ex: Intelligence Artificielle)" onChange={handleChange} value={formData.specialite} style={styles.input} />
                        </div>
                        
                        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <button type="submit" style={styles.button}>Enregistrer l'enseignant</button>
                        </div>
                    </form>
                </div>
            )}

            {/* TABLEAU DES ENSEIGNANTS */}
            <div style={{ ...styles.card, padding: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Matricule</th>
                            <th style={styles.th}>Nom & Prénom</th>
                            <th style={styles.th}>Grade</th>
                            <th style={styles.th}>Spécialité</th>
                            <th style={styles.th}>Capacité</th>
                            <th style={styles.th}>Statut</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEnseignants.length > 0 ? filteredEnseignants.map((ens) => (
                            <tr key={ens.id_enseignant} style={{ transition: '0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <td style={styles.td}><strong>{ens.matricule}</strong></td>
                                <td style={styles.td}>
                                    <div style={{ fontWeight: '600' }}>{ens.nom} {ens.prenom}</div>
                                    <div style={{ fontSize: '12px', color: colors.secondary }}>{ens.email}</div>
                                </td>
                                <td style={styles.td}>{getGradeBadge(ens.grade)}</td>
                                <td style={styles.td}>{ens.specialite || '—'}</td>
                                <td style={styles.td}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <div style={{ width: '40px', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: '0%', height: '100%', backgroundColor: colors.success }}></div>
                                        </div>
                                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>0/{ens.capacite_encadrement}</span>
                                    </div>
                                </td>
                                <td style={styles.td}>{getStatutBadge(ens.statut_enseignant)}</td>
                                <td style={styles.td}>
                                    {ens.statut_enseignant !== 'Inactif' ? (
                                        <>
                                            <button 
                                                onClick={() => handleEdit(ens)}
                                                style={{ ...styles.actionBtn, backgroundColor: '#DBEAFE', color: '#1D4ED8' }}
                                            >
                                                ✏️ Modifier
                                            </button>
                                            <button 
                                                onClick={() => handleDesactivate(ens.id_enseignant)}
                                                style={{ ...styles.actionBtn, backgroundColor: '#FEF3C7', color: '#B45309' }}
                                            >
                                                🚫 Désactiver
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(ens.id_enseignant)}
                                                style={{ ...styles.actionBtn, backgroundColor: '#FEE2E2', color: '#991B1B' }}
                                            >
                                                🗑️ Supprimer
                                            </button>
                                        </>
                                    ) : (
                                        <button 
                                            onClick={() => handleActivate(ens.id_enseignant)}
                                            style={{ ...styles.actionBtn, backgroundColor: '#DCFCE7', color: '#166534' }}
                                        >
                                            ✅ Réactiver
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" style={{ ...styles.td, textAlign: 'center', padding: '40px', color: colors.secondary }}>
                                    {showDesactivated ? 'Aucun enseignant désactivé.' : 'Aucun enseignant trouvé.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL DE MODIFICATION */}
            {showModal && editData && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '500px', maxWidth: '90%' }}>
                        <h3 style={{ marginTop: 0, color: colors.primary }}>Modifier l'Enseignant</h3>
                        <form onSubmit={handleUpdate}>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                <input name="matricule" value={editData.matricule} onChange={handleEditChange} style={styles.input} placeholder="Matricule" />
                                <input name="nom" value={editData.nom} onChange={handleEditChange} style={styles.input} placeholder="Nom" />
                                <input name="prenom" value={editData.prenom} onChange={handleEditChange} style={styles.input} placeholder="Prénom" />
                                <input name="email" value={editData.email} onChange={handleEditChange} style={styles.input} placeholder="Email" />
                                <select name="grade" value={editData.grade} onChange={handleEditChange} style={styles.input}>
                                    <option value="Professeur">Professeur</option>
                                    <option value="MCF">Maître de Conférences</option>
                                    <option value="Assistant">Assistant</option>
                                </select>
                                <input name="specialite" value={editData.specialite || ''} onChange={handleEditChange} style={styles.input} placeholder="Spécialité" />
                                <input name="capacite_encadrement" type="number" value={editData.capacite_encadrement} onChange={handleEditChange} style={styles.input} placeholder="Capacité d'encadrement" />
                            </div>
                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => { setShowModal(false); setEditData(null); }} style={{ ...styles.button, backgroundColor: colors.secondary }}>Annuler</button>
                                <button type="submit" style={styles.button}>Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Enseignants;
