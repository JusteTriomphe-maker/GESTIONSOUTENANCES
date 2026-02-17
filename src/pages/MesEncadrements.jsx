import { useState, useEffect } from 'react';
import { apiCall } from '../config/api.js';

const MesEncadrements = ({ user }) => {
    const [encadrements, setEncadrements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [debugId, setDebugId] = useState("Chargement...");

    

    const fetchEncadrements = async () => {
        setLoading(true);
        // Affiche l'ID utilisé pour la recherche
        setDebugId(user.id); 
        
        try {
            console.log("🔍 Recherche encadrements pour l'ID Enseignant :", user.id);
            const res = await apiCall(`/api/encadrements/enseignant/${user.id}`);
            const data = await res.json();
            console.log("📦 Résultat SQL :", data);
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
        <div className="p-8">
            <h2 className="text-xl font-semibold mb-4">👥 Mes Encadrements</h2>

            {loading ? (
                <div>Chargement...</div>
            ) : (
                <div>
                    {encadrements.length === 0 ? (
                        <div className="text-center text-gray-500 p-10 bg-white rounded-lg">Aucun encadrement trouvé</div>
                    ) : (
                        encadrements.map((item) => (
                            <div key={item.id_attribution} className="bg-white p-4 mb-3 rounded-md border">
                                <strong className="block text-gray-800">{item.nom_etudiant}</strong>
                                <div className="text-sm text-gray-600">{item.theme_titre}</div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default MesEncadrements;