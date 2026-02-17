import { useState, useEffect } from 'react';
import { apiCall } from '../config/api.js';

const Attribution = () => {
    const [formData, setFormData] = useState({ id_impetrant: '', id_enseignant: '', id_theme: '' });
    const [options, setOptions] = useState({ impetrants: [], enseignants: [], themes: [] });
    const [attributions, setAttributions] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [showChangeModal, setShowChangeModal] = useState(false);
    const [selectedAttribution, setSelectedAttribution] = useState(null);
    const [newTeacherId, setNewTeacherId] = useState('');

    // Utilisation de `apiCall` centralisé pour gérer l'Authorization header

    // Charger les données du formulaire (Dropdowns)
    const fetchOptions = async () => {
        try {
            const res = await apiCall('/api/attributions/form-data');
            if (res.ok) {
                const data = await res.json();
                setOptions(data);
            }
        } catch (error) { console.error(error); }
    };

    // Charger la liste des attributions
    const fetchAttributions = async () => {
        try {
            const res = await apiCall('/api/attributions');
            if (res.ok) {
                const data = await res.json();
                setAttributions(data);
            }
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        fetchOptions();
        fetchAttributions();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: 'Traitement...', type: 'info' });
        try {
            const res = await apiCall('/api/attributions/add', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                setMessage({ text: "✅ Attribution réussie !", type: 'success' });
                setFormData({ id_impetrant: '', id_enseignant: '', id_theme: '' });
                fetchAttributions();
                fetchOptions();
            } else {
                setMessage({ text: "❌ Erreur : " + data.message, type: 'danger' });
            }
        } catch (error) {
            setMessage({ text: "❌ Erreur serveur", type: 'danger' });
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir annuler cette attribution ?")) return;
        
        try {
            const res = await apiCall(`/api/attributions/cancel/${id}`, { method: 'PUT' });
            const data = await res.json();
            
            if (res.ok) {
                setMessage({ text: "✅ Attribution annulée avec succès !", type: 'success' });
                fetchAttributions();
                fetchOptions();
            } else {
                setMessage({ text: "❌ Erreur : " + data.message, type: 'danger' });
            }
        } catch (error) {
            setMessage({ text: "❌ Erreur serveur", type: 'danger' });
        }
    };

    const handleOpenChangeModal = (attr) => {
        setSelectedAttribution(attr);
        setNewTeacherId('');
        setShowChangeModal(true);
    };

    const handleChangeDirector = async (e) => {
        e.preventDefault();
        if (!newTeacherId) {
            alert("Veuillez sélectionner un nouvel enseignant");
            return;
        }
        
        try {
            const res = await apiCall(`/api/attributions/change/${selectedAttribution.id_attribution}`, {
                method: 'PUT',
                body: JSON.stringify({ id_enseignant: newTeacherId })
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage({ text: "✅ Directeur de mémoire modifié avec succès !", type: 'success' });
                setShowChangeModal(false);
                setSelectedAttribution(null);
                fetchAttributions();
                fetchOptions();
            } else {
                setMessage({ text: "❌ Erreur : " + data.message, type: 'danger' });
            }
        } catch (error) {
            setMessage({ text: "❌ Erreur serveur", type: 'danger' });
        }
    };

    const filteredAttributions = attributions.filter(attr => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return attr.nom_etudiant?.toLowerCase().includes(search) || 
               attr.prenom_etudiant?.toLowerCase().includes(search) || 
               attr.nom_ens?.toLowerCase().includes(search) ||
               attr.prenom_ens?.toLowerCase().includes(search) ||
               attr.theme_titre?.toLowerCase().includes(search);
    });

    // Styles moved to Tailwind classes

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-[#234666] text-lg font-semibold">🤝 Attribution des Directeurs de Mémoire</h2>
                <div className="bg-[#234666] text-white px-4 py-1 rounded-full text-sm font-bold">{attributions.length} Attributions</div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-md mb-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : message.type === 'danger' ? 'bg-red-50 text-red-800' : 'bg-yellow-50 text-yellow-800'}`}>
                    {message.text}
                </div>
            )}

            <div>
                <input
                    type="text"
                    placeholder="🔍 Rechercher par étudiant, enseignant ou thème..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border rounded-md border-gray-200 w-full max-w-md"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-[#234666] text-md font-semibold mb-4">➕ Nouvelle Attribution</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">IMPÉTRANT</label>
                            <select name="id_impetrant" onChange={handleChange} value={formData.id_impetrant} required className="w-full p-3 border rounded-md border-gray-200">
                                <option value="">-- Sélectionner un Impétrant --</option>
                                {options.impetrants.map(imp => (
                                    <option key={imp.id_impetrant} value={imp.id_impetrant}>{imp.nom} {imp.prenom}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">DIRECTEUR DE MÉMOIRE</label>
                            <select name="id_enseignant" onChange={handleChange} value={formData.id_enseignant} required className="w-full p-3 border rounded-md border-gray-200">
                                <option value="">-- Sélectionner un Enseignant --</option>
                                {options.enseignants.map(ens => (
                                    <option key={ens.id_enseignant} value={ens.id_enseignant}>{ens.nom} {ens.prenom} ({ens.grade})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">THÈME VALIDÉ</label>
                            <select name="id_theme" onChange={handleChange} value={formData.id_theme} required className="w-full p-3 border rounded-md border-gray-200">
                                <option value="">-- Sélectionner un Thème --</option>
                                {options.themes.map(th => (
                                    <option key={th.id_theme} value={th.id_theme}>{th.titre}</option>
                                ))}
                            </select>
                        </div>

                        <button type="submit" className="w-full mt-2 py-3 bg-[#234666] text-white rounded-md font-semibold">Attribuer le directeur</button>
                    </form>
                </div>

                <div className="md:col-span-2 bg-white rounded-lg shadow p-2">
                    <div className="px-4 py-3 border-b">
                        <h3 className="m-0 text-md">Attributions en cours ({filteredAttributions.length})</h3>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="text-xs text-gray-500 uppercase">
                                    <th className="px-4 py-3 text-left">Étudiant</th>
                                    <th className="px-4 py-3 text-left">Directeur</th>
                                    <th className="px-4 py-3 text-left">Thème</th>
                                    <th className="px-4 py-3 text-left">Date</th>
                                    <th className="px-4 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAttributions.length > 0 ? filteredAttributions.map((attr) => (
                                    <tr key={attr.id_attribution} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-4">
                                            <div className="font-semibold text-[#234666]">{attr.nom_etudiant} {attr.prenom_etudiant}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="font-medium">{attr.nom_ens} {attr.prenom_ens}</div>
                                            <div className="text-xs text-gray-500">{attr.grade_ens}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="max-w-[200px] truncate">{attr.theme_titre}</div>
                                            <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${attr.statut_theme === 'Validé' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'}`}>{attr.statut_theme}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm text-gray-500">{new Date(attr.date_attribution).toLocaleDateString('fr-FR')}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <button onClick={() => handleOpenChangeModal(attr)} className="text-sm mr-2 px-3 py-1 rounded bg-blue-50 text-blue-700">🔄 Changer</button>
                                            <button onClick={() => handleCancel(attr.id_attribution)} className="text-sm px-3 py-1 rounded bg-red-50 text-red-700">❌ Annuler</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-20 text-gray-500">Aucune attribution trouvée.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL CHANGEMENT DIRECTEUR */}
            {showChangeModal && selectedAttribution && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                        <h3 className="text-[#234666] text-lg font-semibold">Changer le Directeur de Mémoire</h3>
                        <p className="text-gray-500 text-sm">
                            Étudiant: <strong>{selectedAttribution.nom_etudiant} {selectedAttribution.prenom_etudiant}</strong><br/>
                            Directeur actuel: <strong>{selectedAttribution.nom_ens} {selectedAttribution.prenom_ens}</strong>
                        </p>
                        <form onSubmit={handleChangeDirector}>
                            <div className="mt-4">
                                <label className="text-xs font-bold text-gray-500 block mb-2">NOUVEAU DIRECTEUR</label>
                                <select value={newTeacherId} onChange={(e) => setNewTeacherId(e.target.value)} required className="w-full p-3 border rounded-md border-gray-200">
                                    <option value="">-- Sélectionner un nouvel enseignant --</option>
                                    {options.enseignants.map(ens => (
                                        <option key={ens.id_enseignant} value={ens.id_enseignant}>{ens.nom} {ens.prenom} ({ens.grade})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mt-5 flex gap-3 justify-end">
                                <button type="button" onClick={() => { setShowChangeModal(false); setSelectedAttribution(null); }} className="px-4 py-2 rounded-md bg-gray-200">Annuler</button>
                                <button type="submit" className="px-4 py-2 rounded-md bg-[#234666] text-white">Confirmer le changement</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attribution;
