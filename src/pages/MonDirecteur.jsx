import { useState, useEffect } from 'react';
import { apiCall } from '../config/api.js';

const MonDirecteur = ({ user }) => {
    const [directeur, setDirecteur] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDirecteur = async () => {
        try {
            const res = await apiCall(`/api/attributions/etudiant/${user.id}`);
            if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
            const data = await res.json();
            setDirecteur(data && data.length > 0 ? data[0] : null);
        } catch (err) {
            console.error(err);
            setError('Impossible de charger les infos du directeur.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (user && user.id) fetchDirecteur(); }, [user]);

    if (loading) return <div className="p-6 text-center">Chargement...</div>;

    return (
        <div className="max-w-md mx-auto p-6">
            <h2 className="text-center text-xl font-semibold mb-6">Mon Directeur de Mémoire</h2>

            {error && <div className="text-red-600 text-center mb-4">{error}</div>}

            {!directeur ? (
                <div className="text-center text-gray-500 p-8 bg-white rounded-lg border">
                    <p className="font-semibold">Aucun directeur attribué.</p>
                    <p className="text-sm">Veuillez contacter l'administration ou attendre qu'un thème vous soit attribué.</p>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg border">
                    <div className="text-center mb-4">
                        <div className="w-14 h-14 bg-indigo-100 rounded-full mx-auto flex items-center justify-center text-2xl">👨‍🏫</div>
                        <h3 className="mt-3 text-lg font-semibold">{directeur.nom_enseignant} {directeur.prenom_enseignant}</h3>
                    </div>
                    <p><strong>Email :</strong> {directeur.email_enseignant}</p>
                </div>
            )}
        </div>
    );
};

export default MonDirecteur;