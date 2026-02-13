import { useState, useEffect } from 'react';

const Soutenances = ({ user }) => {
    const [formData, setFormData] = useState({ id_memoire: '', date_soutenance: '', heure_soutenance: '', salle: '' });
    const [jury, setJury] = useState({ president: '', rapporteur: '', examinateur: '' });
    const [options, setOptions] = useState({ memoires: [], enseignants: [] });
    const [soutenances, setSoutenances] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatut, setFilterStatut] = useState('all');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showModal, setShowModal] = useState(false);
    const [selectedSoutenance, setSelectedSoutenance] = useState(null);
    const [editData, setEditData] = useState({ date_soutenance: '', heure_soutenance: '', salle: '' });

    const colors = {
        primary: '#234666',
        secondary: '#64748B',
        success: '#10B981',
        danger: '#D34053',
        warning: '#F59E0B',
        info: '#3C50E0',
        accent: '#7C3AED'
    };

    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    const fetchOptions = async () => {
        try {
            const res = await fetch('/api/soutenances/form-data', { headers: getAuthHeaders() });
            const data = await res.json();
            setOptions(data);
        } catch (error) { console.error("Erreur options", error); }
    };

    const fetchSoutenances = async () => {
        try {
            const res = await fetch('/api/soutenances', { headers: getAuthHeaders() });
            const data = await res.json();
            setSoutenances(data);
        } catch (error) { console.error("Erreur soutenances", error); }
    };

    useEffect(() => {
        fetchOptions();
        fetchSoutenances();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleJuryChange = (e) => setJury({ ...jury, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!jury.president || !jury.rapporteur) {
            setMessage({ text: "❌ Le jury doit avoir au moins un président et un rapporteur", type: 'danger' });
            return;
        }

        const juryArray = [
            { id_enseignant: jury.president, role: 'President' },
            { id_enseignant: jury.rapporteur, role: 'Rapporteur' },
        ];
        if (jury.examinateur) juryArray.push({ id_enseignant: jury.examinateur, role: 'Examinateur' });

        setMessage({ text: 'Planification en cours...', type: 'info' });

        try {
            const res = await fetch('/api/soutenances/add', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ ...formData, jury: juryArray })
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage({ text: "✅ Soutenance planifiée avec succès !", type: 'success' });
                setFormData({ id_memoire: '', date_soutenance: '', heure_soutenance: '', salle: '' });
                setJury({ president: '', rapporteur: '', examinateur: '' });
                fetchSoutenances();
                fetchOptions();
            } else {
                setMessage({ text: "❌ Erreur : " + data.message, type: 'danger' });
            }
        } catch (error) { 
            setMessage({ text: "❌ Erreur serveur", type: 'danger' }); 
        }
    };

    const handleTerminer = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir marquer cette soutenance comme terminée ?")) return;
        
        try {
            const res = await fetch(`/api/soutenances/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ statut_soutenance: 'Terminée' })
            });
            if (res.ok) {
                setMessage({ text: "✅ Soutenance marquée comme terminée !", type: 'success' });
                fetchSoutenances();
            }
        } catch (error) { console.error(error); }
    };

    const handleAjourner = async (id) => {
        setSelectedSoutenance(soutenances.find(s => s.id_soutenance === id));
        setEditData({ date_soutenance: '', heure_soutenance: '', salle: '' });
        setShowModal(true);
    };

    const submitAjournement = async (e) => {
        e.preventDefault();
        if (!editData.date_soutenance || !editData.salle) {
            setMessage({ text: "❌ Veuillez remplir tous les champs", type: 'danger' });
            return;
        }

        try {
            const res = await fetch(`/api/soutenances/${selectedSoutenance.id_soutenance}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ 
                    date_soutenance: editData.date_soutenance,
                    heure_soutenance: editData.heure_soutenance,
                    salle: editData.salle,
                    statut_soutenance: 'Ajournée' 
                })
            });
            if (res.ok) {
                setMessage({ text: "✅ Soutenance ajournée avec succès !", type: 'success' });
                setShowModal(false);
                fetchSoutenances();
            }
        } catch (error) { console.error(error); }
    };

    const filteredSoutenances = soutenances.filter(sout => {
        if (filterStatut !== 'all' && sout.statut_soutenance !== filterStatut) return false;
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return sout.nom_etudiant?.toLowerCase().includes(search) || 
               sout.prenom_etudiant?.toLowerCase().includes(search) || 
               sout.theme_titre?.toLowerCase().includes(search) ||
               sout.salle?.toLowerCase().includes(search);
    });

    const getStats = () => {
        return {
            total: soutenances.length,
            planifiees: soutenances.filter(s => s.statut_soutenance === 'Planifiée').length,
            terminees: soutenances.filter(s => s.statut_soutenance === 'Terminée').length,
            ajournees: soutenances.filter(s => s.statut_soutenance === 'Ajournée').length
        };
    };

    const stats = getStats();

    const styles = {
        card: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '30px' },
        input: { padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
        label: { display: 'block', fontSize: '12px', fontWeight: 'bold', color: colors.primary, marginBottom: '5px', marginTop: '10px' },
        badge: (s) => {
            const config = {
                'Planifiée': { bg: '#DBEAFE', color: '#1D4ED8' },
                'Terminée': { bg: '#DCFCE7', color: '#166534' },
                'Ajournée': { bg: '#FEE2E2', color: '#991B1B' }
            };
            const c = config[s] || config['Planifiée'];
            return { padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', backgroundColor: c.bg, color: c.color };
        },
        actionBtn: { padding: '8px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginRight: '5px' }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ margin: 0, color: colors.primary }}>📅 Planification des Soutenances</h2>
            </div>

            {/* STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
                <div style={{ ...styles.card, padding: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.primary }}>{stats.total}</div>
                    <div style={{ fontSize: '12px', color: colors.secondary }}>Total</div>
                </div>
                <div style={{ ...styles.card, padding: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.info }}>{stats.planifiees}</div>
                    <div style={{ fontSize: '12px', color: colors.secondary }}>Planifiées</div>
                </div>
                <div style={{ ...styles.card, padding: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.success }}>{stats.terminees}</div>
                    <div style={{ fontSize: '12px', color: colors.secondary }}>Terminées</div>
                </div>
                <div style={{ ...styles.card, padding: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.danger }}>{stats.ajournees}</div>
                    <div style={{ fontSize: '12px', color: colors.secondary }}>Ajournées</div>
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

            {/* RECHERCHE ET FILTRE */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="🔍 Rechercher par étudiant, thème ou salle..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px', width: '300px' }}
                />
                <select 
                    value={filterStatut} 
                    onChange={(e) => setFilterStatut(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px' }}
                >
                    <option value="all">Tous les statuts</option>
                    <option value="Planifiée">Planifiées</option>
                    <option value="Terminée">Terminées</option>
                    <option value="Ajournée">Ajournées</option>
                </select>
            </div>

            {/* FORMULAIRE DE PLANIFICATION */}
            <div style={{ ...styles.card, borderLeft: `5px solid ${colors.accent}` }}>
                <h3 style={{ marginTop: 0, fontSize: '18px', color: colors.primary }}>➕ Nouvelle Soutenance</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={styles.label}>MÉMOIRE À SOUTENIR</label>
                            <select name="id_memoire" onChange={handleChange} value={formData.id_memoire} required style={styles.input}>
                                <option value="">Choisir un mémoire...</option>
                                {options.memoires?.map(m => <option key={m.id_memoire} value={m.id_memoire}>{m.titre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={styles.label}>SALLE</label>
                            <input name="salle" placeholder="Ex: Amphi A" onChange={handleChange} value={formData.salle} required style={styles.input} />
                        </div>
                        <div>
                            <label style={styles.label}>DATE</label>
                            <input name="date_soutenance" type="date" onChange={handleChange} value={formData.date_soutenance} required style={styles.input} />
                        </div>
                        <div>
                            <label style={styles.label}>HEURE</label>
                            <input name="heure_soutenance" type="time" onChange={handleChange} value={formData.heure_soutenance} required style={styles.input} />
                        </div>
                    </div>

                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#F1F5F9', borderRadius: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>COMPOSITION DU JURY</span>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '10px' }}>
                            <select name="president" onChange={handleJuryChange} value={jury.president} required style={styles.input}>
                                <option value="">Président *</option>
                                {options.enseignants?.map(e => <option key={e.id_enseignant} value={e.id_enseignant}>{e.nom} {e.prenom}</option>)}
                            </select>
                            <select name="rapporteur" onChange={handleJuryChange} value={jury.rapporteur} required style={styles.input}>
                                <option value="">Rapporteur *</option>
                                {options.enseignants?.map(e => <option key={e.id_enseignant} value={e.id_enseignant}>{e.nom} {e.prenom}</option>)}
                            </select>
                            <select name="examinateur" onChange={handleJuryChange} value={jury.examinateur} style={styles.input}>
                                <option value="">Examinateur</option>
                                {options.enseignants?.map(e => <option key={e.id_enseignant} value={e.id_enseignant}>{e.nom} {e.prenom}</option>)}
                            </select>
                        </div>
                    </div>

                    <button type="submit" style={{ marginTop: '20px', padding: '12px 30px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Confirmer la planification
                    </button>
                </form>
            </div>

            {/* TABLEAU DES SOUTENANCES */}
            <div style={{ ...styles.card, padding: '10px' }}>
                <div style={{ padding: '15px 20px', borderBottom: '1px solid #F1F5F9' }}>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>Soutenances ({filteredSoutenances.length})</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', fontSize: '12px', color: colors.secondary }}>
                            <th style={{ padding: '15px' }}>DATE & HEURE</th>
                            <th style={{ padding: '15px' }}>IMPÉTRANT & SUJET</th>
                            <th style={{ padding: '15px' }}>SALLE</th>
                            <th style={{ padding: '15px' }}>STATUT</th>
                            <th style={{ padding: '15px' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSoutenances.length > 0 ? filteredSoutenances.map((sout) => (
                            <tr key={sout.id_soutenance} style={{ borderBottom: '1px solid #F1F5F9', transition: '0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ fontWeight: 'bold', color: colors.primary }}>
                                        {new Date(sout.date_soutenance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                    <div style={{ fontSize: '12px', color: colors.secondary }}>🕒 {sout.heure_soutenance || '--:--'}</div>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ fontWeight: '600', color: colors.primary }}>{sout.nom_etudiant} {sout.prenom_etudiant}</div>
                                    <div style={{ fontSize: '12px', color: colors.secondary, maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {sout.theme_titre}
                                    </div>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{ padding: '4px 10px', backgroundColor: '#E2E8F0', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                                        {sout.salle}
                                    </span>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <span style={styles.badge(sout.statut_soutenance)}>{sout.statut_soutenance}</span>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    {sout.statut_soutenance === 'Planifiée' && (
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button 
                                                onClick={() => handleTerminer(sout.id_soutenance)} 
                                                style={{ ...styles.actionBtn, backgroundColor: colors.success, color: 'white' }}
                                            >
                                                ✓ Terminer
                                            </button>
                                            <button 
                                                onClick={() => handleAjourner(sout.id_soutenance)} 
                                                style={{ ...styles.actionBtn, backgroundColor: colors.warning, color: 'white' }}
                                            >
                                                ⏰ Ajourner
                                            </button>
                                        </div>
                                    )}
                                    {sout.statut_soutenance === 'Terminée' && (
                                        <span style={{ color: colors.success, fontWeight: 'bold', fontSize: '14px' }}>✓ Validée</span>
                                    )}
                                    {sout.statut_soutenance === 'Ajournée' && (
                                        <button 
                                            onClick={() => handleTerminer(sout.id_soutenance)} 
                                            style={{ ...styles.actionBtn, backgroundColor: colors.success, color: 'white' }}
                                        >
                                            ✓ Marquer Terminée
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: colors.secondary }}>
                                    Aucune soutenance trouvée.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL AJOURNEMENT */}
            {showModal && selectedSoutenance && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '450px', maxWidth: '90%' }}>
                        <h3 style={{ marginTop: 0, color: colors.primary }}>Ajourner la Soutenance</h3>
                        <p style={{ color: colors.secondary, fontSize: '14px' }}>
                            Étudiant: <strong>{selectedSoutenance.nom_etudiant} {selectedSoutenance.prenom_etudiant}</strong>
                        </p>
                        <form onSubmit={submitAjournement}>
                            <div style={{ marginTop: '15px' }}>
                                <label style={styles.label}>NOUVELLE DATE</label>
                                <input 
                                    type="date" 
                                    value={editData.date_soutenance}
                                    onChange={(e) => setEditData({ ...editData, date_soutenance: e.target.value })}
                                    required
                                    style={styles.input}
                                />
                            </div>
                            <div style={{ marginTop: '15px' }}>
                                <label style={styles.label}>NOUVELLE HEURE</label>
                                <input 
                                    type="time" 
                                    value={editData.heure_soutenance}
                                    onChange={(e) => setEditData({ ...editData, heure_soutenance: e.target.value })}
                                    style={styles.input}
                                />
                            </div>
                            <div style={{ marginTop: '15px' }}>
                                <label style={styles.label}>NOUVELLE SALLE</label>
                                <input 
                                    type="text" 
                                    value={editData.salle}
                                    onChange={(e) => setEditData({ ...editData, salle: e.target.value })}
                                    required
                                    placeholder="Nouvelle salle"
                                    style={styles.input}
                                />
                            </div>
                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)}
                                    style={{ ...styles.actionBtn, padding: '10px 20px', backgroundColor: colors.secondary, color: 'white' }}
                                >
                                    Annuler
                                </button>
                                <button 
                                    type="submit" 
                                    style={{ ...styles.actionBtn, padding: '10px 20px', backgroundColor: colors.warning, color: 'white' }}
                                >
                                    Confirmer l'ajournement
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Soutenances;
