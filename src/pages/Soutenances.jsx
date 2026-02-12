import { useState, useEffect } from 'react';

const Soutenances = () => {
    const [formData, setFormData] = useState({ id_memoire: '', date_soutenance: '', heure_soutenance: '', salle: '' });
    const [jury, setJury] = useState({ president: '', rapporteur: '', examinateur: '' });
    const [options, setOptions] = useState({ memoires: [], enseignants: [] });
    const [soutenances, setSoutenances] = useState([]);

    const colors = {
        primary: '#234666', // Ton bleu
        accent: '#6610f2',  // Violet pour l'événementiel
        success: '#10B981',
        danger: '#D34053',
        warning: '#F0950E',
        bg: '#F8FAFC'
    };

    const fetchOptions = async () => {
        try {
            const res = await fetch('/api/soutenances/form-data');
            const data = await res.json();
            setOptions(data);
        } catch (error) { console.error("Erreur options", error); }
    };

    const fetchSoutenances = async () => {
        try {
            const res = await fetch('/api/soutenances');
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
        if (!jury.president || !jury.rapporteur) return alert("Jury incomplet !");

        const juryArray = [
            { id_enseignant: jury.president, role: 'President' },
            { id_enseignant: jury.rapporteur, role: 'Rapporteur' },
        ];
        if (jury.examinateur) juryArray.push({ id_enseignant: jury.examinateur, role: 'Examinateur' });

        try {
            const res = await fetch('/api/soutenances/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, jury: juryArray })
            });
            if (res.ok) {
                setFormData({ id_memoire: '', date_soutenance: '', heure_soutenance: '', salle: '' });
                setJury({ president: '', rapporteur: '', examinateur: '' });
                fetchSoutenances();
            }
        } catch (error) { alert("Erreur serveur"); }
    };

    const handleUpdate = async (id, action) => {
        let body = {};
        if (action === 'terminer') {
            if (!window.confirm("Marquer comme terminée ?")) return;
            body = { statut_soutenance: 'Terminée' };
        } else if (action === 'ajourner') {
            const newDate = window.prompt("Nouvelle date (AAAA-MM-JJ) :");
            if (!newDate) return;
            body = { date_soutenance: newDate, statut_soutenance: 'Ajournée' };
        }
        
        try {
            const res = await fetch(`/api/soutenances/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.ok) fetchSoutenances();
        } catch (error) { console.error(error); }
    };

    const styles = {
        card: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '30px' },
        input: { padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
        label: { display: 'block', fontSize: '12px', fontWeight: 'bold', color: colors.primary, marginBottom: '5px', marginTop: '10px' },
        status: (s) => ({
            padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', color: 'white',
            backgroundColor: s === 'Terminée' ? '#64748B' : (s === 'Ajournée' ? colors.danger : colors.accent)
        })
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h2 style={{ color: colors.primary, marginBottom: '25px' }}>Calendrier & Planification</h2>

            {/* FORMULAIRE DE PLANIFICATION */}
            <div style={{ ...styles.card, borderLeft: `5px solid ${colors.accent}` }}>
                <h3 style={{ marginTop: 0, fontSize: '18px', color: colors.accent }}>📅 Nouvelle Soutenance</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={styles.label}>MÉMOIRE À SOUTENIR</label>
                            <select name="id_memoire" onChange={handleChange} value={formData.id_memoire} required style={styles.input}>
                                <option value="">Choisir un mémoire...</option>
                                {options.memoires.map(m => <option key={m.id_memoire} value={m.id_memoire}>{m.titre}</option>)}
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
                                <option value=""> Président </option>
                                {options.enseignants.map(e => <option key={e.id_enseignant} value={e.id_enseignant}>{e.nom} {e.prenom}</option>)}
                            </select>
                            <select name="rapporteur" onChange={handleJuryChange} value={jury.rapporteur} required style={styles.input}>
                                <option value=""> Rapporteur </option>
                                {options.enseignants.map(e => <option key={e.id_enseignant} value={e.id_enseignant}>{e.nom} {e.prenom}</option>)}
                            </select>
                            <select name="examinateur" onChange={handleJuryChange} value={jury.examinateur} style={styles.input}>
                                <option value=""> Examinateur (Optionnel) </option>
                                {options.enseignants.map(e => <option key={e.id_enseignant} value={e.id_enseignant}>{e.nom} {e.prenom}</option>)}
                            </select>
                        </div>
                    </div>

                    <button type="submit" style={{ marginTop: '20px', padding: '12px 30px', backgroundColor: colors.accent, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Confirmer la planification
                    </button>
                </form>
            </div>

            {/* TABLEAU DES SOUTENANCES */}
            <div style={{ ...styles.card, padding: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', fontSize: '12px', color: colors.secondary }}>
                            <th style={{ padding: '15px' }}>PROGRAMMATION</th>
                            <th style={{ padding: '15px' }}>IMPÉTRANT & SUJET</th>
                            <th style={{ padding: '15px' }}>SALLE</th>
                            <th style={{ padding: '15px' }}>STATUT</th>
                            <th style={{ padding: '15px' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {soutenances.map((sout) => (
                            <tr key={sout.id_soutenance} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ fontWeight: 'bold', color: colors.primary }}>{new Date(sout.date_soutenance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                                    <div style={{ fontSize: '12px', color: colors.secondary }}>🕒 {sout.heure_soutenance}</div>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ fontWeight: '600' }}>{sout.nom_etudiant} {sout.prenom_etudiant}</div>
                                    <div style={{ fontSize: '12px', color: colors.secondary, maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sout.theme_titre}</div>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{ padding: '4px 8px', backgroundColor: '#E2E8F0', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{sout.salle}</span>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <span style={styles.status(sout.statut_soutenance)}>{sout.statut_soutenance}</span>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    {sout.statut_soutenance === 'Planifiée' && (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleUpdate(sout.id_soutenance, 'terminer')} style={{ border: 'none', backgroundColor: colors.success, color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Terminer</button>
                                            <button onClick={() => handleUpdate(sout.id_soutenance, 'ajourner')} style={{ border: 'none', backgroundColor: colors.warning, color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Ajourner</button>
                                        </div>
                                    )}
                                    {sout.statut_soutenance === 'Terminée' && <span style={{ color: colors.success, fontWeight: 'bold' }}>✓ Validée</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Soutenances;