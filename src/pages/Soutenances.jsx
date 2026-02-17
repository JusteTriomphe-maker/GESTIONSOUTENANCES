import { useState, useEffect } from 'react';
import { apiCall } from '../config/api.js';

const Soutenances = ({ user }) => {
    const [formData, setFormData] = useState({ id_memoire: '', date_soutenance: '', heure_soutenance: '', salle: '' });
    const [jury, setJury] = useState({ president: '', rapporteur: '', examinateur: '' });
    const [options, setOptions] = useState({ memoires: [], enseignants: [] });
    const [soutenances, setSoutenances] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatut, setFilterStatut] = useState('all');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showModal, setShowModal] = useState(false);
    const [selectedSoutenance, setSelectedSoutenance] = useState(null);
    const [editData, setEditData] = useState({ date_soutenance: '', heure_soutenance: '', salle: '' });

    const colors = {
        primary: '#234666',
        secondary: '#64748B',
        success: '#10B981',
        danger: '#D34053',
        warning: '#F59E0B',
        info: '#3C50E0',
        accent: '#7C3AED'
    };

    const fetchOptions = async () => {
        try {
            const res = await apiCall('/api/soutenances/form-data');
            const data = await res.json();
            setOptions(data);
        } catch (error) { console.error("Erreur options", error); }
    };

    const fetchSoutenances = async () => {
        try {
            const res = await apiCall('/api/soutenances');
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
        if (!jury.president || !jury.rapporteur) {
            setMessage({ text: "❌ Le jury doit avoir au moins un président et un rapporteur", type: 'danger' });
            return;
        }

        const juryArray = [
            { id_enseignant: jury.president, role: 'President' },
            { id_enseignant: jury.rapporteur, role: 'Rapporteur' },
        ];
        if (jury.examinateur) juryArray.push({ id_enseignant: jury.examinateur, role: 'Examinateur' });

        setMessage({ text: 'Planification en cours...', type: 'info' });

        try {
            const res = await apiCall('/api/soutenances/add', { method: 'POST', body: JSON.stringify({ ...formData, jury: juryArray }) });
            const data = await res.json();

            if (res.ok) {
                setMessage({ text: "✅ Soutenance planifiée avec succès !", type: 'success' });
                setFormData({ id_memoire: '', date_soutenance: '', heure_soutenance: '', salle: '' });
                setJury({ president: '', rapporteur: '', examinateur: '' });
                fetchSoutenances();
                fetchOptions();
            } else {
                setMessage({ text: "❌ Erreur : " + (data.message || 'Erreur'), type: 'danger' });
            }
        } catch (error) {
            setMessage({ text: "❌ Erreur serveur", type: 'danger' });
        }
    };

    const handleTerminer = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir marquer cette soutenance comme terminée ?")) return;
        
        try {
            const res = await apiCall(`/api/soutenances/${id}`, { method: 'PUT', body: JSON.stringify({ statut_soutenance: 'Terminée' }) });
            if (res.ok) {
                setMessage({ text: "✅ Soutenance marquée comme terminée !", type: 'success' });
                fetchSoutenances();
            }
        } catch (error) { console.error(error); }
    };

    const handleAjourner = async (id) => {
        setSelectedSoutenance(soutenances.find(s => s.id_soutenance === id));
        setEditData({ date_soutenance: '', heure_soutenance: '', salle: '' });
        setShowModal(true);
    };

    const submitAjournement = async (e) => {
        e.preventDefault();
        if (!editData.date_soutenance || !editData.salle) {
            setMessage({ text: "❌ Veuillez remplir tous les champs", type: 'danger' });
            return;
        }

        try {
            const res = await apiCall(`/api/soutenances/${selectedSoutenance.id_soutenance}`, { method: 'PUT', body: JSON.stringify({ 
                date_soutenance: editData.date_soutenance,
                heure_soutenance: editData.heure_soutenance,
                salle: editData.salle,
                statut_soutenance: 'Ajournée' 
            }) });
            if (res.ok) {
                setMessage({ text: "✅ Soutenance ajournée avec succès !", type: 'success' });
                setShowModal(false);
                fetchSoutenances();
            }
        } catch (error) { console.error(error); }
    };

    const filteredSoutenances = soutenances.filter(sout => {
        if (filterStatut !== 'all' && sout.statut_soutenance !== filterStatut) return false;
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return sout.nom_etudiant?.toLowerCase().includes(search) || 
               sout.prenom_etudiant?.toLowerCase().includes(search) || 
               sout.theme_titre?.toLowerCase().includes(search) ||
               sout.salle?.toLowerCase().includes(search);
    });

    const getStats = () => {
        return {
            total: soutenances.length,
            planifiees: soutenances.filter(s => s.statut_soutenance === 'Planifiée').length,
            terminees: soutenances.filter(s => s.statut_soutenance === 'Terminée').length,
            ajournees: soutenances.filter(s => s.statut_soutenance === 'Ajournée').length
        };
    };

    const stats = getStats();

    const cardClass = 'bg-white rounded-lg shadow p-6 mb-6';
    const inputClass = 'w-full px-3 py-2 border rounded-md';
    const labelClass = 'block text-sm font-semibold text-gray-700 mb-2';
    const badgeClass = (s) => s === 'Planifiée' ? 'bg-blue-100 text-blue-700' : s === 'Terminée' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">📅 Planification des Soutenances</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className={cardClass + ' text-center'}>
                    <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                    <div className="text-sm text-gray-500">Total</div>
                </div>
                <div className={cardClass + ' text-center'}>
                    <div className="text-2xl font-bold text-blue-600">{stats.planifiees}</div>
                    <div className="text-sm text-gray-500">Planifiées</div>
                </div>
                <div className={cardClass + ' text-center'}>
                    <div className="text-2xl font-bold text-green-600">{stats.terminees}</div>
                    <div className="text-sm text-gray-500">Terminées</div>
                </div>
                <div className={cardClass + ' text-center'}>
                    <div className="text-2xl font-bold text-red-600">{stats.ajournees}</div>
                    <div className="text-sm text-gray-500">Ajournées</div>
                </div>
            </div>

            {message.text && (
                <div className={`${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : message.type === 'danger' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'} border rounded-md p-3 mb-4`}>
                    {message.text}
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
                <input type="text" placeholder="🔍 Rechercher par étudiant, thème ou salle..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-3 py-2 border rounded-md w-full md:w-80" />
                <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-3 py-2 border rounded-md w-full md:w-56">
                    <option value="all">Tous les statuts</option>
                    <option value="Planifiée">Planifiées</option>
                    <option value="Terminée">Terminées</option>
                    <option value="Ajournée">Ajournées</option>
                </select>
            </div>

            <div className={cardClass + ' border-l-4 border-indigo-500'}>
                <h3 className="text-lg font-semibold mb-4">➕ Nouvelle Soutenance</h3>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className={labelClass}>MÉMOIRE À SOUTENIR</label>
                            <select name="id_memoire" onChange={handleChange} value={formData.id_memoire} required className={inputClass}>
                                <option value="">Choisir un mémoire...</option>
                                {options.memoires?.map(m => <option key={m.id_memoire} value={m.id_memoire}>{m.titre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>SALLE</label>
                            <input name="salle" placeholder="Ex: Amphi A" onChange={handleChange} value={formData.salle} required className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>DATE</label>
                            <input name="date_soutenance" type="date" onChange={handleChange} value={formData.date_soutenance} required className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>HEURE</label>
                            <input name="heure_soutenance" type="time" onChange={handleChange} value={formData.heure_soutenance} required className={inputClass} />
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-gray-50 rounded">
                        <span className="text-sm font-semibold text-gray-700">COMPOSITION DU JURY</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                            <select name="president" onChange={handleJuryChange} value={jury.president} required className={inputClass}>
                                <option value="">Président *</option>
                                {options.enseignants?.map(e => <option key={e.id_enseignant} value={e.id_enseignant}>{e.nom} {e.prenom}</option>)}
                            </select>
                            <select name="rapporteur" onChange={handleJuryChange} value={jury.rapporteur} required className={inputClass}>
                                <option value="">Rapporteur *</option>
                                {options.enseignants?.map(e => <option key={e.id_enseignant} value={e.id_enseignant}>{e.nom} {e.prenom}</option>)}
                            </select>
                            <select name="examinateur" onChange={handleJuryChange} value={jury.examinateur} className={inputClass}>
                                <option value="">Examinateur</option>
                                {options.enseignants?.map(e => <option key={e.id_enseignant} value={e.id_enseignant}>{e.nom} {e.prenom}</option>)}
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md font-bold">Confirmer la planification</button>
                </form>
            </div>

            <div className={cardClass + ' p-0'}>
                <div className="px-4 py-3 border-b">
                    <h3 className="m-0 text-lg">Soutenances ({filteredSoutenances.length})</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="text-left text-sm text-gray-500">
                                <th className="px-4 py-3">DATE & HEURE</th>
                                <th className="px-4 py-3">IMPÉTRANT & SUJET</th>
                                <th className="px-4 py-3">SALLE</th>
                                <th className="px-4 py-3">STATUT</th>
                                <th className="px-4 py-3">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSoutenances.length > 0 ? filteredSoutenances.map((sout) => (
                                <tr key={sout.id_soutenance} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-4">
                                        <div className="font-bold text-gray-800">{new Date(sout.date_soutenance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                        <div className="text-sm text-gray-500">🕒 {sout.heure_soutenance || '--:--'}</div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="font-semibold text-gray-800">{sout.nom_etudiant} {sout.prenom_etudiant}</div>
                                        <div className="text-sm text-gray-500 max-w-xs truncate">{sout.theme_titre}</div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="px-3 py-1 bg-gray-100 rounded text-sm font-bold">{sout.salle}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-1 rounded-full text-sm font-bold ${badgeClass(sout.statut_soutenance)}`}>{sout.statut_soutenance}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        {sout.statut_soutenance === 'Planifiée' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleTerminer(sout.id_soutenance)} className="px-3 py-1 bg-green-600 text-white rounded">✓ Terminer</button>
                                                <button onClick={() => handleAjourner(sout.id_soutenance)} className="px-3 py-1 bg-yellow-500 text-white rounded">⏰ Ajourner</button>
                                            </div>
                                        )}
                                        {sout.statut_soutenance === 'Terminée' && (
                                            <span className="text-green-600 font-bold text-sm">✓ Validée</span>
                                        )}
                                        {sout.statut_soutenance === 'Ajournée' && (
                                            <button onClick={() => handleTerminer(sout.id_soutenance)} className="px-3 py-1 bg-green-600 text-white rounded">✓ Marquer Terminée</button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-10 text-center text-gray-500">Aucune soutenance trouvée.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && selectedSoutenance && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold">Ajourner la Soutenance</h3>
                        <p className="text-sm text-gray-600">Étudiant: <strong>{selectedSoutenance.nom_etudiant} {selectedSoutenance.prenom_etudiant}</strong></p>
                        <form onSubmit={submitAjournement} className="mt-4">
                            <div className="mb-3">
                                <label className={labelClass}>NOUVELLE DATE</label>
                                <input type="date" value={editData.date_soutenance} onChange={(e) => setEditData({ ...editData, date_soutenance: e.target.value })} required className={inputClass} />
                            </div>
                            <div className="mb-3">
                                <label className={labelClass}>NOUVELLE HEURE</label>
                                <input type="time" value={editData.heure_soutenance} onChange={(e) => setEditData({ ...editData, heure_soutenance: e.target.value })} className={inputClass} />
                            </div>
                            <div className="mb-4">
                                <label className={labelClass}>NOUVELLE SALLE</label>
                                <input type="text" value={editData.salle} onChange={(e) => setEditData({ ...editData, salle: e.target.value })} required placeholder="Nouvelle salle" className={inputClass} />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded">Annuler</button>
                                <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded">Confirmer l'ajournement</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Soutenances;
