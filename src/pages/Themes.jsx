import { useState, useEffect } from 'react';

const Themes = () => {
    const [formData, setFormData] = useState({ titre: '', description: '', domaine: 'Génie Logiciel', auteur: 'Admin', type_auteur: 'Enseignant' });
    const [themes, setThemes] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });

    const colors = {
        primary: '#234666',
        secondary: '#64748B',
        success: '#10B981',
        danger: '#D34053',
        warning: '#F0950E',
        info: '#3C50E0'
    };

    const fetchThemes = async () => {
        try {
            const res = await fetch('/api/themes');
            const data = await res.json();
            setThemes(data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => { fetchThemes(); }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: 'Traitement...', type: 'info' });
        try {
            const res = await fetch('/api/themes/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setMessage({ text: "✅ Thème proposé avec succès !", type: 'success' });
                setFormData({ titre: '', description: '', domaine: 'Génie Logiciel', auteur: 'Admin', type_auteur: 'Enseignant' });
                fetchThemes();
            } else {
                setMessage({ text: "❌ Erreur lors de l'envoi", type: 'danger' });
            }
        } catch (error) { setMessage({ text: "❌ Erreur serveur", type: 'danger' }); }
    };

    const handleValidate = async (id) => {
        try {
            const res = await fetch(`/api/themes/validate/${id}`, { method: 'PUT' });
            if (res.ok) fetchThemes();
        } catch (error) { alert("Erreur lors de la validation"); }
    };

    const styles = {
        card: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '30px' },
        input: { padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', width: '100%', boxSizing: 'border-box', marginBottom: '10px' },
        badge: (statut) => {
            const config = {
                'Validé': { bg: '#DCFCE7', color: '#166534' },
                'Soumis': { bg: '#FEF9C3', color: '#854D0E' },
                'Rejeté': { bg: '#FEE2E2', color: '#991B1B' }
            };
            const s = config[statut] || config['Soumis'];
            return { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backgroundColor: s.bg, color: s.color };
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h2 style={{ color: colors.primary, marginBottom: '25px' }}>Gestion des Thèmes de Mémoire</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
                
                {/* COLONNE GAUCHE : FORMULAIRE */}
                <div>
                    <div style={styles.card}>
                        <h3 style={{ marginTop: 0, fontSize: '16px', color: colors.primary }}>Proposer un nouveau thème</h3>
                        <form onSubmit={handleSubmit}>
                            <input name="titre" placeholder="Titre du thème" onChange={handleChange} value={formData.titre} required style={styles.input} />
                            <textarea name="description" placeholder="Description du sujet..." onChange={handleChange} value={formData.description} required rows="4" style={{ ...styles.input, resize: 'none' }}></textarea>
                            
                            <label style={{ fontSize: '12px', color: colors.secondary, fontWeight: 'bold' }}>DOMAINE D'ÉTUDE</label>
                            <select name="domaine" onChange={handleChange} value={formData.domaine} style={styles.input}>
                                <option value="GL">Génie Logiciel (GL)</option>
                                <option value="CS">Cybersécurité (CS)</option>
                                <option value="SR">Systèmes et Réseaux (SR)</option>
                                <option value="ASR">Administration Système (AS)</option>
                                <option value="AP">Administration Publique (AP)</option>
                            </select>

                            <label style={{ fontSize: '12px', color: colors.secondary, fontWeight: 'bold' }}>ORIGINE</label>
                            <select name="type_auteur" onChange={handleChange} value={formData.type_auteur} style={styles.input}>
                                <option value="Enseignant">Enseignant</option>
                                <option value="Etudiant">Étudiant</option>
                                <option value="Partenaire">Entreprise / Partenaire</option>
                            </select>

                            <input name="auteur" placeholder="Nom de l'auteur" onChange={handleChange} value={formData.auteur} required style={styles.input} />
                            
                            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
                                Soumettre le thème
                            </button>
                            {message.text && <p style={{ fontSize: '13px', textAlign: 'center', color: message.type === 'success' ? colors.success : colors.danger }}>{message.text}</p>}
                        </form>
                    </div>
                </div>

                {/* COLONNE DROITE : LISTE */}
                <div>
                    <div style={{ ...styles.card, padding: '0' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between' }}>
                            <h3 style={{ margin: 0, fontSize: '16px' }}>Thèmes enregistrés ({themes.length})</h3>
                        </div>
                        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                            {themes.map((th) => (
                                <div key={th.id_theme} style={{ padding: '20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '5px' }}>
                                            <span style={styles.badge(th.statut_theme)}>{th.statut_theme}</span>
                                            <small style={{ color: colors.secondary, fontWeight: 'bold' }}>{th.domaine}</small>
                                        </div>
                                        <div style={{ fontWeight: 'bold', color: colors.primary, fontSize: '15px' }}>{th.titre}</div>
                                        <div style={{ fontSize: '13px', color: colors.secondary, marginTop: '4px' }}>Par: <strong>{th.auteur}</strong> ({th.type_auteur})</div>
                                    </div>
                                    
                                    <div style={{ marginLeft: '15px' }}>
                                        {th.statut_theme === 'Soumis' ? (
                                            <button 
                                                onClick={() => handleValidate(th.id_theme)}
                                                style={{ padding: '8px 15px', backgroundColor: colors.info, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                                            >
                                                Valider
                                            </button>
                                        ) : (
                                            <span style={{ color: colors.success, fontSize: '20px' }}>●</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Themes;