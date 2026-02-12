import { useState, useEffect } from 'react';

const Impetrants = () => {
    const [formData, setFormData] = useState({ matricule: '', nom: '', prenom: '', filiere: 'GL', cycle: 'Licence', annee_academique: '2024-2025' });
    const [impetrants, setImpetrants] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });

    const colors = {
        primary: '#234666', // Ton bleu Webleb
        secondary: '#64748B',
        success: '#10B981',
        danger: '#D34053',
        accent: '#3C50E0'
    };

    const fetchImpetrants = async () => {
        try {
            const res = await fetch('/api/impetrants');
            const data = await res.json();
            setImpetrants(data);
        } catch (error) {
            console.error("Erreur de chargement", error);
        }
    };

    useEffect(() => { fetchImpetrants(); }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: 'Traitement...', type: 'info' });
        try {
            const res = await fetch('/api/impetrants/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage({ text: "✅ Impétrant enregistré avec succès !", type: 'success' });
                setFormData({ matricule: '', nom: '', prenom: '', filiere: 'GL', cycle: 'Licence', annee_academique: '2024-2025' });
                fetchImpetrants();
            } else {
                setMessage({ text: "❌ Erreur : " + data.message, type: 'danger' });
            }
        } catch (error) {
            setMessage({ text: "❌ Erreur serveur", type: 'danger' });
        }
    };

    // Badge dynamique pour la filière
    const getFiliereBadge = (filiere) => {
        const styles = {
            'GL': { bg: '#EEF2FF', color: '#4338CA' },
            'RS': { bg: '#ECFDF5', color: '#047857' },
            'ASR': { bg: '#FFF7ED', color: '#C2410C' }
        };
        const style = styles[filiere] || { bg: '#F3F4F6', color: '#374151' };
        return (
            <span style={{ 
                padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700',
                backgroundColor: style.bg, color: style.color 
            }}>{filiere}</span>
        );
    };

    const styles = {
        card: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '30px' },
        input: { padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
        button: { padding: '12px 25px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
        th: { padding: '15px', textAlign: 'left', borderBottom: '2px solid #F1F5F9', color: colors.secondary, fontSize: '12px', textTransform: 'uppercase' },
        td: { padding: '15px', borderBottom: '1px solid #F1F5F9', fontSize: '14px' }
    };

    return (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ margin: 0, color: colors.primary }}>Gestion des Impétrants</h2>
                <div style={{ backgroundColor: colors.primary, color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                    {impetrants.length} Étudiants
                </div>
            </div>

            {/* FORMULAIRE */}
            <div style={styles.card}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px' }}>Nouvelle Inscription</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                        <input name="matricule" placeholder="Matricule" onChange={handleChange} value={formData.matricule} required style={styles.input} />
                        <input name="nom" placeholder="Nom de l'étudiant" onChange={handleChange} value={formData.nom} required style={styles.input} />
                        <input name="prenom" placeholder="Prénom" onChange={handleChange} value={formData.prenom} required style={styles.input} />
                        
                        <select name="filiere" onChange={handleChange} value={formData.filiere} style={styles.input}>
                            <option value="GL">Génie Logiciel (GL)</option>
                            <option value="CS">Cybersécurité (CS)</option>
                            <option value="SR">Systèmes et Réseaux (SR)</option>
                            <option value="ASR">Administration Système (AS)</option>
                             <option value="AP">Administration Publique (AP)</option>
                        </select>

                        <select name="cycle" onChange={handleChange} value={formData.cycle} style={styles.input}>
                            <option value="Licence">Cycle Licence</option>
                            <option value="Master">Cycle Master</option>
                        </select>
                        
                        <input name="annee_academique" placeholder="Année (2024-2025)" onChange={handleChange} value={formData.annee_academique} required style={styles.input} />
                    </div>
                    
                    <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button type="submit" style={styles.button}>Enregistrer l'impétrant</button>
                        {message.text && (
                            <span style={{ fontSize: '14px', fontWeight: '500', color: message.type === 'success' ? colors.success : colors.danger }}>
                                {message.text}
                            </span>
                        )}
                    </div>
                </form>
            </div>

            {/* LISTE TABLEAU */}
            <div style={{ ...styles.card, padding: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Matricule</th>
                            <th style={styles.th}>Étudiant</th>
                            <th style={styles.th}>Filière</th>
                            <th style={styles.th}>Cycle</th>
                            <th style={styles.th}>Année Académique</th>
                        </tr>
                    </thead>
                    <tbody>
                        {impetrants.length > 0 ? impetrants.map((imp) => (
                            <tr key={imp.id_impetrant} style={{ transition: '0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <td style={styles.td}><code style={{ color: colors.accent, fontWeight: 'bold' }}>#{imp.matricule}</code></td>
                                <td style={styles.td}>
                                    <div style={{ fontWeight: '600', color: '#1E293B' }}>{imp.nom.toUpperCase()}</div>
                                    <div style={{ fontSize: '12px', color: colors.secondary }}>{imp.prenom}</div>
                                </td>
                                <td style={styles.td}>{getFiliereBadge(imp.filiere)}</td>
                                <td style={styles.td}>
                                    <span style={{ color: imp.cycle === 'Master' ? '#7C3AED' : '#334155', fontWeight: '500' }}>
                                        {imp.cycle}
                                    </span>
                                </td>
                                <td style={styles.td}><span style={{ color: colors.secondary }}>{imp.annee_academique}</span></td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: colors.secondary }}>
                                    Aucun étudiant inscrit pour le moment.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Impetrants;