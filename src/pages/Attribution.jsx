import { useState, useEffect } from 'react';

const Attribution = () => {
    const [formData, setFormData] = useState({ id_impetrant: '', id_enseignant: '', id_theme: '' });
    const [options, setOptions] = useState({ impetrants: [], enseignants: [], themes: [] });
    const [attributions, setAttributions] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [showChangeModal, setShowChangeModal] = useState(false);
    const [selectedAttribution, setSelectedAttribution] = useState(null);
    const [newTeacherId, setNewTeacherId] = useState('');

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

    // Charger les données du formulaire (Dropdowns)
    const fetchOptions = async () => {
        try {
            const res = await fetch('/api/attributions/form-data', { headers: getAuthHeaders() });
            const data = await res.json();
            setOptions(data);
        } catch (error) { console.error(error); }
    };

    // Charger la liste des attributions
    const fetchAttributions = async () => {
        try {
            const res = await fetch('/api/attributions', { headers: getAuthHeaders() });
            const data = await res.json();
            setAttributions(data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        fetchOptions();
        fetchAttributions();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: 'Traitement...', type: 'info' });
        try {
            const res = await fetch('/api/attributions/add', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                setMessage({ text: "✅ Attribution réussie !", type: 'success' });
                setFormData({ id_impetrant: '', id_enseignant: '', id_theme: '' });
                fetchAttributions();
                fetchOptions();
            } else {
                setMessage({ text: "❌ Erreur : " + data.message, type: 'danger' });
            }
        } catch (error) {
            setMessage({ text: "❌ Erreur serveur", type: 'danger' });
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir annuler cette attribution ?")) return;
        
        try {
            const res = await fetch(`/api/attributions/cancel/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage({ text: "✅ Attribution annulée avec succès !", type: 'success' });
                fetchAttributions();
                fetchOptions();
            } else {
                setMessage({ text: "❌ Erreur : " + data.message, type: 'danger' });
            }
        } catch (error) {
            setMessage({ text: "❌ Erreur serveur", type: 'danger' });
        }
    };

    const handleOpenChangeModal = (attr) => {
        setSelectedAttribution(attr);
        setNewTeacherId('');
        setShowChangeModal(true);
    };

    const handleChangeDirector = async (e) => {
        e.preventDefault();
        if (!newTeacherId) {
            alert("Veuillez sélectionner un nouvel enseignant");
            return;
        }
        
        try {
            const res = await fetch(`/api/attributions/change/${selectedAttribution.id_attribution}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ id_enseignant: newTeacherId })
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage({ text: "✅ Directeur de mémoire modifié avec succès !", type: 'success' });
                setShowChangeModal(false);
                setSelectedAttribution(null);
                fetchAttributions();
                fetchOptions();
            } else {
                setMessage({ text: "❌ Erreur : " + data.message, type: 'danger' });
            }
        } catch (error) {
            setMessage({ text: "❌ Erreur serveur", type: 'danger' });
        }
    };

    const filteredAttributions = attributions.filter(attr => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return attr.nom_etudiant?.toLowerCase().includes(search) || 
               attr.prenom_etudiant?.toLowerCase().includes(search) || 
               attr.nom_ens?.toLowerCase().includes(search) ||
               attr.prenom_ens?.toLowerCase().includes(search) ||
               attr.theme_titre?.toLowerCase().includes(search);
    });

    const styles = {
        card: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '30px' },
        input: { padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
        button: { padding: '12px 25px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
        th: { padding: '15px', textAlign: 'left', borderBottom: '2px solid #F1F5F9', color: colors.secondary, fontSize: '12px', textTransform: 'uppercase' },
        td: { padding: '15px', borderBottom: '1px solid #F1F5F9', fontSize: '14px' },
        actionBtn: { padding: '8px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginRight: '5px' }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ margin: 0, color: colors.primary }}>🤝 Attribution des Directeurs de Mémoire</h2>
                <div style={{ backgroundColor: colors.primary, color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                    {attributions.length} Attributions
                </div>
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

            {/* RECHERCHE */}
            <div style={{ marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="🔍 Rechercher par étudiant, enseignant ou thème..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', width: '350px' }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                {/* FORMULAIRE */}
                <div style={styles.card}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px', color: colors.primary }}>➕ Nouvelle Attribution</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div>
                                <label style={{ fontSize: '12px', color: colors.secondary, fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>IMPÉTRANT</label>
                                <select name="id_impetrant" onChange={handleChange} value={formData.id_impetrant} required style={styles.input}>
                                    <option value="">-- Sélectionner un Impétrant --</option>
                                    {options.impetrants.map(imp => (
                                        <option key={imp.id_impetrant} value={imp.id_impetrant}>
                                            {imp.nom} {imp.prenom}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', color: colors.secondary, fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>DIRECTEUR DE MÉMOIRE</label>
                                <select name="id_enseignant" onChange={handleChange} value={formData.id_enseignant} required style={styles.input}>
                                    <option value="">-- Sélectionner un Enseignant --</option>
                                    {options.enseignants.map(ens => (
                                        <option key={ens.id_enseignant} value={ens.id_enseignant}>
                                            {ens.nom} {ens.prenom} ({ens.grade})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', color: colors.secondary, fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>THÈME VALIDÉ</label>
                                <select name="id_theme" onChange={handleChange} value={formData.id_theme} required style={styles.input}>
                                    <option value="">-- Sélectionner un Thème --</option>
                                    {options.themes.map(th => (
                                        <option key={th.id_theme} value={th.id_theme}>
                                            {th.titre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button type="submit" style={{ ...styles.button, width: '100%', marginTop: '20px' }}>
                            Attribuer le directeur
                        </button>
                    </form>
                </div>

                {/* LISTE DES ATTRIBUTIONS */}
                <div style={{ ...styles.card, padding: '10px' }}>
                    <div style={{ padding: '15px 20px', borderBottom: '1px solid #F1F5F9' }}>
                        <h3 style={{ margin: 0, fontSize: '16px' }}>Attributions en cours ({filteredAttributions.length})</h3>
                    </div>
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Étudiant</th>
                                    <th style={styles.th}>Directeur</th>
                                    <th style={styles.th}>Thème</th>
                                    <th style={styles.th}>Date</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAttributions.length > 0 ? filteredAttributions.map((attr) => (
                                    <tr key={attr.id_attribution} style={{ transition: '0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: '600', color: colors.primary }}>{attr.nom_etudiant} {attr.prenom_etudiant}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: '500' }}>{attr.nom_ens} {attr.prenom_ens}</div>
                                            <div style={{ fontSize: '11px', color: colors.secondary }}>{attr.grade_ens}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {attr.theme_titre}
                                            </div>
                                            <span style={{ 
                                                padding: '2px 8px', borderRadius: '4px', fontSize: '10px', 
                                                backgroundColor: attr.statut_theme === 'Validé' ? '#DCFCE7' : '#FEF3C7',
                                                color: attr.statut_theme === 'Validé' ? '#166534' : '#92400E'
                                            }}>
                                                {attr.statut_theme}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ fontSize: '12px', color: colors.secondary }}>
                                                {new Date(attr.date_attribution).toLocaleDateString('fr-FR')}
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <button 
                                                onClick={() => handleOpenChangeModal(attr)}
                                                style={{ ...styles.actionBtn, backgroundColor: '#DBEAFE', color: '#1D4ED8' }}
                                            >
                                                🔄 Changer
                                            </button>
                                            <button 
                                                onClick={() => handleCancel(attr.id_attribution)}
                                                style={{ ...styles.actionBtn, backgroundColor: '#FEE2E2', color: '#991B1B' }}
                                            >
                                                ❌ Annuler
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" style={{ ...styles.td, textAlign: 'center', padding: '40px', color: colors.secondary }}>
                                            Aucune attribution trouvée.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL CHANGEMENT DIRECTEUR */}
            {showChangeModal && selectedAttribution && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '500px', maxWidth: '90%' }}>
                        <h3 style={{ marginTop: 0, color: colors.primary }}>Changer le Directeur de Mémoire</h3>
                        <p style={{ color: colors.secondary, fontSize: '14px' }}>
                            Étudiant: <strong>{selectedAttribution.nom_etudiant} {selectedAttribution.prenom_etudiant}</strong><br/>
                            Directeur actuel: <strong>{selectedAttribution.nom_ens} {selectedAttribution.prenom_ens}</strong>
                        </p>
                        <form onSubmit={handleChangeDirector}>
                            <div style={{ marginTop: '15px' }}>
                                <label style={{ fontSize: '12px', color: colors.secondary, fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>NOUVEAU DIRECTEUR</label>
                                <select 
                                    value={newTeacherId} 
                                    onChange={(e) => setNewTeacherId(e.target.value)}
                                    required
                                    style={styles.input}
                                >
                                    <option value="">-- Sélectionner un nouvel enseignant --</option>
                                    {options.enseignants.map(ens => (
                                        <option key={ens.id_enseignant} value={ens.id_enseignant}>
                                            {ens.nom} {ens.prenom} ({ens.grade})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button 
                                    type="button" 
                                    onClick={() => { setShowChangeModal(false); setSelectedAttribution(null); }}
                                    style={{ ...styles.button, backgroundColor: colors.secondary }}
                                >
                                    Annuler
                                </button>
                                <button type="submit" style={styles.button}>
                                    Confirmer le changement
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attribution;
