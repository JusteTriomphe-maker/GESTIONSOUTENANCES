import { useState, useEffect } from 'react';
import { apiCall } from '../config/api.js';

const Archives = () => {
    const [archives, setArchives] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Styles moved to Tailwind classes

    useEffect(() => {
        apiCall('/api/soutenances?archive=true')
            .then(res => res.json())
            .then(data => setArchives(data))
            .catch(err => console.error(err));
    }, []);

    // Filtrage simple pour la recherche
    const filteredArchives = archives.filter(sout => 
        sout.nom_etudiant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sout.theme_titre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Tailwind will handle layout and styling

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-[#234666] text-lg font-semibold">📁 Archives des Soutenances</h2>
                    <p className="text-sm text-gray-500 mt-1">Historique complet des travaux de fin de cycle validés.</p>
                </div>

                <input
                    type="text"
                    placeholder="Rechercher un étudiant ou un sujet..."
                    className="px-3 py-2 border rounded-md border-gray-200 w-full max-w-sm"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white p-2 rounded-lg shadow">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="text-xs text-gray-500 uppercase">
                            <th className="px-4 py-3 text-left">Période</th>
                            <th className="px-4 py-3 text-left">Étudiant</th>
                            <th className="px-4 py-3 text-left">Sujet du Mémoire</th>
                            <th className="px-4 py-3 text-left">Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredArchives.length > 0 ? filteredArchives.map((sout) => (
                            <tr key={sout.id_soutenance} className="hover:bg-gray-50 transition">
                                <td className="px-4 py-4 align-top">
                                    <div className="font-semibold">{new Date(sout.date_soutenance).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                    <small className="text-gray-500">Session de {sout.heure_soutenance}</small>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="font-bold text-[#234666]">{sout.nom_etudiant?.toUpperCase()} {sout.prenom_etudiant}</div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="max-w-[450px] leading-6">{sout.theme_titre}</div>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="inline-block px-3 py-1 rounded bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-100">Dossier archivé</span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="py-16 text-center text-gray-500">{searchTerm ? "Aucun résultat pour cette recherche." : "Le coffre-fort est vide pour le moment."}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="text-center text-sm text-gray-500">Propulsé par le système de gestion des soutenances — {new Date().getFullYear()}</div>
        </div>
    );
};

export default Archives;