import { useState, useEffect } from 'react';

const Themes = ({ user }) => {
    const [formData, setFormData] = useState({ titre: '', description: '', domaine: 'GL', auteur: '', type_auteur: 'Enseignant' });
    const [themes, setThemes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatut, setFilterStatut] = useState('all');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showModal, setShowModal] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [reformulationComment, setReformulationComment] = useState('');

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

    const fetchThemes = async () => {
        try {
            const res = await fetch('/api/themes', { headers: getAuthHeaders() });
            const data = await res.json();
            setThemes(data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => { 
        fetchThemes(); 
        if (user) {
            setFormData(prev => ({ ...prev, auteur: `${user.nom} ${user.prenom}` }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: 'Traitement...', type: 'info' });
        try {
            const res = await fetch('/api/themes/add', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ text: "✅ Thème proposé avec succès !", type: 'success' });
                setFormData({ titre: '', description: '', domaine: 'GL', auteur: user ? `${user.nom} ${user.prenom}` : '', type_auteur: 'Enseignant' });
                fetchThemes();
            } else {
                setMessage({ text: "❌ Erreur : " + data.message, type: 'danger' });
            }
        } catch (error) { 
            setMessage({ text: "❌ Erreur serveur", type: 'danger' }); 
        }
    };

    const handleValidate = async (id) => {
        try {
            const res = await fetch(`/api/themes/validate/${id}`, { 
                method: 'PUT',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                setMessage({ text: "✅ Thème validé avec succès !", type: 'success' });
                fetchThemes();
            }
        } catch (error) { 
            alert("Erreur lors de la validation"); 
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir rejeter ce thème ?")) return;
        try {
            const res = await fetch(`/api/themes/reject/${id}`, { 
                method: 'PUT',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                setMessage({ text: "❌ Thème rejeté", type: 'danger' });
                fetchThemes();
            }
        } catch (error) { 
            alert("Erreur lors du rejet"); 
        }
    };

    const handleRequestReformulation = (theme) => {
        setSelectedTheme(theme);
        setShowModal(true);
    };

    const submitReformulation = async () => {
        if (!reformulationComment.trim()) {
            alert("Veuillez ajouter un commentaire pour la reformulation");
            return;
        }
        try {
            const res = await fetch(`/api/themes/reformulate/${selectedTheme.id_theme}`, { 
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ comment: reformulationComment })
            });
            if (res.ok) {
                setMessage({ text: "📝 Demande de reformulation envoyée !", type: 'warning' });
                setShowModal(false);
                setReformulationComment('');
                fetchThemes();
            }
        } catch (error) { 
            alert("Erreur lors de la demande de reformulation"); 
        }
    };

    const filteredThemes = themes.filter(th => {
        // Filter by status
        if (filterStatut !== 'all' && th.statut_theme !== filterStatut) return false;
        // Filter by search
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return th.titre?.toLowerCase().includes(search) || 
               th.description?.toLowerCase().includes(search) ||
               th.auteur?.toLowerCase().includes(search) ||
               th.domaine?.toLowerCase().includes(search);
    });

    const getStats = () => {
        return {
            total: themes.length,
            valide: themes.filter(t => t.statut_theme === 'Validé').length,
            soumis: themes.filter(t => t.statut_theme === 'Soumis').length,
            rejete: themes.filter(t => t.statut_theme === 'Rejeté').length,
            reformulation: themes.filter(t => t.statut_theme === 'En reformulation').length
        };
    };

    const stats = getStats();

    const styles = {
        card: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '30px' },
        input: { padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', width: '100%', boxSizing: 'border-box', marginBottom: '10px' },
        badge: (statut) => {
            const config = {
                'Validé': { bg: '#DCFCE7', color: '#166534' },
                'Soumis': { bg: '#FEF9C3', color: '#854D0E' },
                'Rejeté': { bg: '#FEE2E2', color: '#991B1B' },
                'En reformulation': { bg: '#DBEAFE', color: '#1D4ED8' }
            };
            const s = config[statut] || config['Soumis'];
            return { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backgroundColor: s.bg, color: s.color };
        },
        actionBtn: { padding: '8px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', marginRight: '5px' }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h2 style={{ color: colors.primary, marginBottom: '25px' }}>📝 Gestion des Thèmes de Mémoire</h2>

            {/* STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '25px' }}>
                <div style={{ ...styles.card, padding: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.primary }}>{stats.total}</div>
                    <div style={{ fontSize: '12px', color: colors.secondary }}>Total</div>
                </div>
                <div style={{ ...styles.card, padding: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.success }}>{stats.valide}</div>
                    <div style={{ fontSize: '12px', color: colors.secondary }}>Validés</div>
                </div>
                <div style={{ ...styles.card, padding: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.warning }}>{stats.soumis}</div>
                    <div style={{ fontSize: '12px', color: colors.secondary }}>En attente</div>
                </div>
                <div style={{ ...styles.card, padding: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.info }}>{stats.reformulation}</div>
                    <div style={{ fontSize: '12px', color: colors.secondary }}>En reformulation</div>
                </div>
                <div style={{ ...styles.card, padding: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.danger }}>{stats.rejete}</div>
                    <div style={{ fontSize: '12px', color: colors.secondary }}>Rejetés</div>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
                
                {/* COLONNE GAUCHE : FORMULAIRE */}
                <div>
                    <div style={styles.card}>
                        <h3 style={{ marginTop: 0, fontSize: '16px', color: colors.primary }}>➕ Proposer un nouveau thème</h3>
                        <form onSubmit={handleSubmit}>
                            <input name="titre" placeholder="Titre du thème *" onChange={handleChange} value={formData.titre} required style={styles.input} />
                            <textarea name="description" placeholder="Description du sujet... *" onChange={handleChange} value={formData.description} required rows="4" style={{ ...styles.input, resize: 'none' }}></textarea>
                            
                            <label style={{ fontSize: '12px', color: colors.secondary, fontWeight: 'bold' }}>DOMAINE D'ÉTUDE</label>
                            <select name="domaine" onChange={handleChange} value={formData.domaine} style={styles.input}>
                                <option value="GL">Génie Logiciel (GL)</option>
                                <option value="CS">Cybersécurité (CS)</option>
                                <option value="SR">Systèmes et Réseaux (SR)</option>
                                <option value="ASR">Administration Système (ASR)</option>
                                <option value="AP">Administration Publique (AP)</option>
                            </select>

                            <label style={{ fontSize: '12px', color: colors.secondary, fontWeight: 'bold' }}>ORIGINE</label>
                            <select name="type_auteur" onChange={handleChange} value={formData.type_auteur} style={styles.input}>
                                <option value="Enseignant">Enseignant</option>
                                <option value="Etudiant">Étudiant</option>
                                <option value="Partenaire">Entreprise / Partenaire</option>
                            </select>

                            <input name="auteur" placeholder="Nom de l'auteur *" onChange={handleChange} value={formData.auteur} required style={styles.input} />
                            
                            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
                                Soumettre le thème
                            </button>
                        </form>
                    </div>
                </div>

                {/* COLONNE DROITE : LISTE */}
                <div>
                    {/* RECHERCHE ET FILTRE */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <input 
                            type="text" 
                            placeholder="🔍 Rechercher un thème..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ ...styles.input, width: '250px', marginBottom: 0 }}
                        />
                        <select 
                            value={filterStatut} 
                            onChange={(e) => setFilterStatut(e.target.value)}
                            style={{ ...styles.input, width: '180px', marginBottom: 0 }}
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="Soumis">En attente</option>
                            <option value="Validé">Validés</option>
                            <option value="Rejeté">Rejetés</option>
                            <option value="En reformulation">En reformulation</option>
                        </select>
                    </div>

                    <div style={{ ...styles.card, padding: '0' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #F1F5F9' }}>
                            <h3 style={{ margin: 0, fontSize: '16px' }}>Thèmes enregistrés ({filteredThemes.length})</h3>
                        </div>
                        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                            {filteredThemes.length > 0 ? filteredThemes.map((th) => (
                                <div key={th.id_theme} style={{ padding: '20px', borderBottom: '1px solid #F1F5F9' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '5px' }}>
                                                <span style={styles.badge(th.statut_theme)}>{th.statut_theme}</span>
                                                <small style={{ color: colors.secondary, fontWeight: 'bold' }}>{th.domaine}</small>
                                            </div>
                                            <div style={{ fontWeight: 'bold', color: colors.primary, fontSize: '15px' }}>{th.titre}</div>
                                            <div style={{ fontSize: '13px', color: colors.secondary, marginTop: '4px' }}>
                                                Par: <strong>{th.auteur}</strong> ({th.type_auteur})
                                            </div>
                                            {th.description && (
                                                <div style={{ fontSize: '12px', color: colors.secondary, marginTop: '8px', fontStyle: 'italic' }}>
                                                    "{th.description.substring(0, 100)}..."
                                                </div>
                                            )}
                                            {th.comment_reformulation && (
                                                <div style={{ fontSize: '12px', color: colors.info, marginTop: '8px', padding: '8px', backgroundColor: '#DBEAFE', borderRadius: '6px' }}>
                                                    📝 Commentaire: {th.comment_reformulation}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div style={{ marginLeft: '15px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            {th.statut_theme === 'Soumis' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleValidate(th.id_theme)}
                                                        style={{ ...styles.actionBtn, backgroundColor: colors.success, color: 'white' }}
                                                    >
                                                        ✅ Valider
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRequestReformulation(th)}
                                                        style={{ ...styles.actionBtn, backgroundColor: colors.info, color: 'white' }}
                                                    >
                                                        📝 Reformuler
                                                    </button>
                                                    <button 
                                                        onClick={() => handleReject(th.id_theme)}
                                                        style={{ ...styles.actionBtn, backgroundColor: colors.danger, color: 'white' }}
                                                    >
                                                        ❌ Rejeter
                                                    </button>
                                                </>
                                            )}
                                            {th.statut_theme === 'En reformulation' && (
                                                <button 
                                                    onClick={() => handleValidate(th.id_theme)}
                                                    style={{ ...styles.actionBtn, backgroundColor: colors.success, color: 'white' }}
                                                >
                                                    ✅ Valider
                                                </button>
                                            )}
                                            {th.statut_theme === 'Validé' && (
                                                <span style={{ color: colors.success, fontSize: '20px' }}>✓</span>
                                            )}
                                            {th.statut_theme === 'Rejeté' && (
                                                <span style={{ color: colors.danger, fontSize: '20px' }}>✕</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ padding: '40px', textAlign: 'center', color: colors.secondary }}>
                                    Aucun thème trouvé.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DEMANDE REFORMULATION */}
            {showModal && selectedTheme && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '500px', maxWidth: '90%' }}>
                        <h3 style={{ marginTop: 0, color: colors.primary }}>Demander une reformulation</h3>
                        <p style={{ color: colors.secondary, fontSize: '14px' }}>
                            Thème: <strong>{selectedTheme.titre}</strong>
                        </p>
                        <textarea 
                            placeholder="Expliquez les modifications à apporter..." 
                            value={reformulationComment}
                            onChange={(e) => setReformulationComment(e.target.value)}
                            rows="4"
                            style={{ ...styles.input, width: '100%', resize: 'none' }}
                        />
                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={() => { setShowModal(false); setReformulationComment(''); }}
                                style={{ ...styles.actionBtn, padding: '10px 20px', backgroundColor: colors.secondary, color: 'white' }}
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={submitReformulation}
                                style={{ ...styles.actionBtn, padding: '10px 20px', backgroundColor: colors.info, color: 'white' }}
                            >
                                Envoyer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Themes;
