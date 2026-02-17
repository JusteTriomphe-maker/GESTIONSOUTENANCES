import { useState, useEffect } from 'react';
import { apiCall } from '../config/api.js';

const Impetrants = () => {
    const [formData, setFormData] = useState({ matricule: '', nom: '', prenom: '', filiere: 'GL', cycle: 'Licence', annee_academique: '2024-2025' });
    const [impetrants, setImpetrants] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });

    // design handled by Tailwind classes

    const fetchImpetrants = async () => {
        try {
            const res = await apiCall('/api/impetrants');
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
            const res = await apiCall('/api/impetrants/add', {
                method: 'POST',
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
        const map = {
            GL: 'bg-indigo-50 text-indigo-700',
            RS: 'bg-emerald-50 text-emerald-700',
            ASR: 'bg-orange-50 text-orange-700'
        };
        const cls = map[filiere] || 'bg-gray-100 text-gray-700';
        return <span className={`px-3 py-1 rounded-md text-xs font-semibold ${cls}`}>{filiere}</span>;
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-primary">Gestion des Impétrants</h2>
                <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">{impetrants.length} Étudiants</div>
            </div>

            {/* FORM */}
            <div className="bg-white rounded-lg p-6 shadow mb-6">
                <h3 className="text-base font-semibold mb-4">Nouvelle Inscription</h3>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="matricule" placeholder="Matricule" onChange={handleChange} value={formData.matricule} required className="w-full px-3 py-2 border rounded-md" />
                        <input name="nom" placeholder="Nom de l'étudiant" onChange={handleChange} value={formData.nom} required className="w-full px-3 py-2 border rounded-md" />
                        <input name="prenom" placeholder="Prénom" onChange={handleChange} value={formData.prenom} required className="w-full px-3 py-2 border rounded-md" />

                        <select name="filiere" onChange={handleChange} value={formData.filiere} className="w-full px-3 py-2 border rounded-md">
                            <option value="GL">Génie Logiciel (GL)</option>
                            <option value="CS">Cybersécurité (CS)</option>
                            <option value="SR">Systèmes et Réseaux (SR)</option>
                            <option value="ASR">Administration Système (AS)</option>
                            <option value="AP">Administration Publique (AP)</option>
                        </select>

                        <select name="cycle" onChange={handleChange} value={formData.cycle} className="w-full px-3 py-2 border rounded-md">
                            <option value="Licence">Cycle Licence</option>
                            <option value="Master">Cycle Master</option>
                        </select>

                        <input name="annee_academique" placeholder="Année (2024-2025)" onChange={handleChange} value={formData.annee_academique} required className="w-full px-3 py-2 border rounded-md" />
                    </div>

                    <div className="mt-4 flex items-center gap-4">
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md font-bold">Enregistrer l'impétrant</button>
                        {message.text && (
                            <span className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</span>
                        )}
                    </div>
                </form>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-lg p-4 shadow">
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr className="text-xs text-gray-500 uppercase">
                            <th className="px-4 py-3">Matricule</th>
                            <th className="px-4 py-3">Étudiant</th>
                            <th className="px-4 py-3">Filière</th>
                            <th className="px-4 py-3">Cycle</th>
                            <th className="px-4 py-3">Année Académique</th>
                        </tr>
                    </thead>
                    <tbody>
                        {impetrants.length > 0 ? impetrants.map((imp) => (
                            <tr key={imp.id_impetrant} className="hover:bg-gray-50 transition">
                                <td className="px-4 py-3"><code className="text-accent font-bold">#{imp.matricule}</code></td>
                                <td className="px-4 py-3">
                                    <div className="font-semibold text-gray-800">{imp.nom?.toUpperCase()}</div>
                                    <div className="text-sm text-gray-500">{imp.prenom}</div>
                                </td>
                                <td className="px-4 py-3">{getFiliereBadge(imp.filiere)}</td>
                                <td className="px-4 py-3">
                                    <span className={`${imp.cycle === 'Master' ? 'text-purple-600' : 'text-gray-700'} font-medium`}>{imp.cycle}</span>
                                </td>
                                <td className="px-4 py-3 text-gray-500">{imp.annee_academique}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="p-10 text-center text-gray-500">Aucun étudiant inscrit pour le moment.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Impetrants;