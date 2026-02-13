import { useState, useEffect } from 'react';

const MesEncadrements = ({ user }) => {
    const [encadrements, setEncadrements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [debugId, setDebugId] = useState("Chargement...");

    const colors = {
        primary: '#1C2434',
        success: '#10B981',
        danger: '#D34053',
        warning: '#F0950E',
    };

    const fetchEncadrements = async () => {
        setLoading(true);
        // Affiche l'ID utilisé pour la recherche
        setDebugId(user.id); 
        
        try {
            console.log("🔍 Recherche encadrements pour l'ID Enseignant :", user.id);
            
            const res = await fetch(`/api/encadrements/enseignant/${user.id}`);
            const data = await res.json();
            
            console.log("📦 Résultat SQL :", data); // Regarde la console du navigateur (F12)
            
            setEncadrements(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erreur:", error);
            setEncadrements([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(user && user.id) fetchEncadrements();
    }, [user]);

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", padding: '20px' }}>
            <h2 style={{ color: colors.primary }}>👥 Mes Encadrements</h2>
            
            {/* --- BOÎTE DE DIAGNOSTIC (Pour trouver le problème) --- */}
            <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', color: '#92400E' }}>
                <strong>🔧 MODE DIAGNOSTIC :</strong><br/>
                Je suis connecté en tant que : <strong>{user.nom}</strong> ({user.role})<br/>
                Mon ID Utilisateur est : <strong>{debugId}</strong><br/>
                <em>Si tu vois "Aucun encadrement", va dans ta base de données, table 'attributions', et regarde si la colonne 'id_enseignant' contient bien la valeur <strong>{debugId}</strong>.</em>
            </div>
            {/* ----------------------------------------------------- */}

            {loading ? <div>Chargement...</div> : (
                <div>
                    {encadrements.length === 0 ? (
                        <div style={{textAlign:'center', color:'#888', padding:'40px', background:'white', borderRadius:'12px'}}>
                            Aucun encadrement trouvé pour l'ID {debugId}.
                        </div>
                    ) : (
                        encadrements.map((item) => (
                            <div key={item.id_attribution} style={{ background: 'white', padding: '15px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                <strong>{item.nom_etudiant}</strong> - {item.theme_titre}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default MesEncadrements;