import { useState, useEffect } from 'react';

const Archives = () => {
    const [archives, setArchives] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const colors = {
        primary: '#234666',
        secondary: '#64748B',
        info: '#0EA5E9',
        bg: '#F8FAFC',
        text: '#1E293B'
    };

    useEffect(() => {
        fetch('/api/soutenances?archive=true')
            .then(res => res.json())
            .then(data => setArchives(data))
            .catch(err => console.error(err));
    }, []);

    // Filtrage simple pour la recherche
    const filteredArchives = archives.filter(sout => 
        sout.nom_etudiant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sout.theme_titre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const styles = {
        card: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '30px' },
        th: { padding: '15px', textAlign: 'left', borderBottom: '2px solid #F1F5F9', color: colors.secondary, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' },
        td: { padding: '15px', borderBottom: '1px solid #F1F5F9', fontSize: '14px', color: colors.text },
        searchInput: { padding: '10px 15px', borderRadius: '8px', border: '1px solid #E2E8F0', width: '300px', outline: 'none', fontSize: '14px' }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <div>
                    <h2 style={{ margin: 0, color: colors.primary }}>📁 Archives des Soutenances</h2>
                    <p style={{ margin: '5px 0 0', color: colors.secondary, fontSize: '14px' }}>
                        Historique complet des travaux de fin de cycle validés.
                    </p>
                </div>
                
                <input 
                    type="text" 
                    placeholder="Rechercher un étudiant ou un sujet..." 
                    style={styles.searchInput}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div style={{ ...styles.card, padding: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Période</th>
                            <th style={styles.th}>Étudiant</th>
                            <th style={styles.th}>Sujet du Mémoire</th>
                            <th style={styles.th}>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredArchives.length > 0 ? filteredArchives.map((sout) => (
                            <tr key={sout.id_soutenance} style={{ transition: '0.2s' }}>
                                <td style={styles.td}>
                                    <div style={{ fontWeight: '600' }}>
                                        {new Date(sout.date_soutenance).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                    <small style={{ color: colors.secondary }}>Session de {sout.heure_soutenance}</small>
                                </td>
                                <td style={styles.td}>
                                    <div style={{ fontWeight: 'bold', color: colors.primary }}>
                                        {sout.nom_etudiant.toUpperCase()} {sout.prenom_etudiant}
                                    </div>
                                </td>
                                <td style={styles.td}>
                                    <div style={{ maxWidth: '450px', lineHeight: '1.4' }}>{sout.theme_titre}</div>
                                </td>
                                <td style={styles.td}>
                                    <span style={{ 
                                        padding: '4px 12px', 
                                        borderRadius: '6px', 
                                        backgroundColor: '#F0F9FF', 
                                        color: '#0369A1', 
                                        fontSize: '12px', 
                                        fontWeight: 'bold',
                                        border: '1px solid #BAE6FD'
                                    }}>
                                        Dossier archivé
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" style={{ padding: '50px', textAlign: 'center', color: colors.secondary }}>
                                    {searchTerm ? "Aucun résultat pour cette recherche." : "Le coffre-fort est vide pour le moment."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: colors.secondary }}>
                Propulsé par le système de gestion des soutenances — {new Date().getFullYear()}
            </div>
        </div>
    );
};

export default Archives;