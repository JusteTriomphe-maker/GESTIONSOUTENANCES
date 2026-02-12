import { useState, useEffect } from 'react';

const Enseignants = () => {
    const [formData, setFormData] = useState({ matricule: '', nom: '', prenom: '', email: '', grade: 'MCF', specialite: '', capacite: 5 });
    const [enseignants, setEnseignants] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Couleurs du thème harmonisé
    const colors = {
        primary: '#234666',
        secondary: '#64748B',
        success: '#10B981',
        danger: '#D34053',
        bg: '#F8FAFC'
    };

    const fetchEnseignants = async () => {
        try {
            const res = await fetch('/api/enseignants');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: "Chargement...", type: 'info' });
        try {
            const res = await fetch('/api/enseignants/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    const styles = {
        card: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '30px' },
        input: { padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
        button: { padding: '12px 25px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: '0.3s' },
        th: { padding: '15px', textAlign: 'left', borderBottom: '2px solid #F1F5F9', color: colors.secondary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' },
        td: { padding: '15px', borderBottom: '1px solid #F1F5F9', fontSize: '14px', color: '#334155' }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ margin: 0, color: colors.primary }}>Gestion des Enseignants</h2>
                <span style={{ fontSize: '14px', color: colors.secondary }}>{enseignants.length} enregistrés</span>
            </div>

            {/* FORMULAIRE D'AJOUT */}
            <div style={styles.card}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px', color: '#1E293B' }}>Ajouter un nouveau directeur de mémoire</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                        <input name="matricule" placeholder="Matricule" onChange={handleChange} value={formData.matricule} required style={styles.input} />
                        <input name="email" type="email" placeholder="Email professionnel" onChange={handleChange} value={formData.email} required style={styles.input} />
                        <input name="nom" placeholder="Nom" onChange={handleChange} value={formData.nom} required style={styles.input} />
                        <input name="prenom" placeholder="Prénom" onChange={handleChange} value={formData.prenom} required style={styles.input} />
                        
                        <select name="grade" onChange={handleChange} value={formData.grade} style={styles.input}>
                            <option value="Professeur">Professeur</option>
                            <option value="MCF">Maître de Conférences</option>
                            <option value="Assistant">Assistant</option>
                        </select>

                        <select name="capacite" onChange={handleChange} value={formData.capacite} style={styles.input}>
                            <option value="3">Quota : 3 étudiants</option>
                            <option value="5">Quota : 5 étudiants (Défaut)</option>
                            <option value="10">Quota : 10 étudiants</option>
                        </select>
                        
                        <input name="specialite" placeholder="Spécialité (ex: Intelligence Artificielle, Réseaux)" onChange={handleChange} value={formData.specialite} style={{ ...styles.input, gridColumn: 'span 2' }} />
                    </div>
                    
                    <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button type="submit" style={styles.button}>Enregistrer l'enseignant</button>
                        {message.text && (
                            <span style={{ fontSize: '14px', fontWeight: '500', color: message.type === 'success' ? colors.success : colors.danger }}>
                                {message.text}
                            </span>
                        )}
                    </div>
                </form>
            </div>

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
                        </tr>
                    </thead>
                    <tbody>
                        {enseignants.length > 0 ? enseignants.map((ens) => (
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
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ ...styles.td, textAlign: 'center', padding: '40px', color: colors.secondary }}>
                                    Aucun enseignant trouvé. Utilisez le formulaire ci-dessus pour en ajouter.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Enseignants;