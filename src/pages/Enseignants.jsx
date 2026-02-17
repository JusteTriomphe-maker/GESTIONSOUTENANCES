import { useState, useEffect } from 'react';
import { apiCall } from '../config/api.js';

const Enseignants = () => {
    const [formData, setFormData] = useState({ matricule: '', nom: '', prenom: '', email: '', grade: 'MCF', specialite: '', capacite: 5 });
    const [editData, setEditData] = useState(null);
    const [enseignants, setEnseignants] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDesactivated, setShowDesactivated] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Couleurs du thème harmonisé
    const colors = {
        primary: '#234666',
        secondary: '#64748B',
        success: '#10B981',
        danger: '#D34053',
        bg: '#F8FAFC',
        warning: '#F59E0B'
    };

    const fetchEnseignants = async () => {
        try {
            const res = await apiCall('/api/enseignants');
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

    const handleEditChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: "Chargement...", type: 'info' });
        try {
            const res = await apiCall('/api/enseignants/add', {
                method: 'POST',
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

    const handleEdit = (ens) => {
        setEditData({ ...ens });
        setShowModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage({ text: 'Modification en cours...', type: 'info' });
        try {
            const res = await apiCall(`/api/enseignants/update/${editData.id_enseignant}`, {
                method: 'PUT',
                body: JSON.stringify(editData)
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage({ text: "✅ Enseignant modifié avec succès !", type: 'success' });
                setShowModal(false);
                setEditData(null);
                fetchEnseignants();
            } else {
                setMessage({ text: "❌ Erreur : " + data.message, type: 'danger' });
            }
        } catch (error) {
            setMessage({ text: "❌ Erreur serveur", type: 'danger' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet enseignant ? Cette action est irréversible.")) return;
        
        try {
            const res = await apiCall(`/api/enseignants/delete/${id}`, { method: 'DELETE' });
            const data = await res.json();
            
            if (res.ok) {
                setMessage({ text: "✅ Enseignant supprimé avec succès !", type: 'success' });
                fetchEnseignants();
            } else {
                setMessage({ text: "❌ Erreur : " + data.message, type: 'danger' });
            }
        } catch (error) {
            setMessage({ text: "❌ Erreur serveur", type: 'danger' });
        }
    };

    const handleDesactivate = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir désactiver cet enseignant ?")) return;
        
        try {
            const res = await apiCall(`/api/enseignants/desactivate/${id}`, { method: 'PUT' });
            const data = await res.json();
            
            if (res.ok) {
                setMessage({ text: "✅ Enseignant désactivé avec succès !", type: 'success' });
                fetchEnseignants();
            } else {
                setMessage({ text: "❌ Erreur : " + data.message, type: 'danger' });
            }
        } catch (error) {
            setMessage({ text: "❌ Erreur serveur", type: 'danger' });
        }
    };

    const handleActivate = async (id) => {
        try {
            const res = await apiCall(`/api/enseignants/activate/${id}`, { method: 'PUT' });
            const data = await res.json();
            
            if (res.ok) {
                setMessage({ text: "✅ Enseignant réactivé avec succès !", type: 'success' });
                fetchEnseignants();
            } else {
                setMessage({ text: "❌ Erreur : " + data.message, type: 'danger' });
            }
        } catch (error) {
            setMessage({ text: "❌ Erreur serveur", type: 'danger' });
        }
    };

    const filteredEnseignants = enseignants.filter(ens => {
        if (showDesactivated) {
            return ens.statut_enseignant === 'Inactif';
        }
        return ens.statut_enseignant !== 'Inactif';
    }).filter(ens => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return ens.matricule?.toLowerCase().includes(search) || 
               ens.nom?.toLowerCase().includes(search) || 
               ens.prenom?.toLowerCase().includes(search) ||
               ens.specialite?.toLowerCase().includes(search) ||
               ens.grade?.toLowerCase().includes(search);
    });

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

    const getStatutBadge = (statut) => {
        const isActive = statut === 'Actif';
        return (
            <span style={{ 
                padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                backgroundColor: isActive ? '#DCFCE7' : '#FEE2E2', 
                color: isActive ? '#166534' : '#991B1B' 
            }}>{statut || 'Actif'}</span>
        );
    };

    const cardClass = 'bg-white rounded-lg p-6 shadow mb-6';
    const inputClass = 'w-full px-3 py-2 border rounded-md';
    const buttonClass = 'px-3 py-2 rounded-md font-semibold';
    const tableHeadClass = 'text-xs text-gray-500 uppercase';
    const tdClass = 'px-4 py-3 text-sm text-gray-700';

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-primary">👨‍🏫 Gestion des Enseignants</h2>
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowDesactivated(!showDesactivated)} className={`${buttonClass} ${showDesactivated ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                        {showDesactivated ? '👁️ Voir Actifs' : '🚫 Voir Désactivés'}
                    </button>
                    <span className="text-sm text-gray-500">{filteredEnseignants.length} enregistrés</span>
                </div>
            </div>

            <div className="mb-4">
                <input type="text" placeholder="🔍 Rechercher par matricule, nom, prénom, spécialité ou grade..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-80 px-3 py-2 border rounded-md" />
            </div>

            {message.text && (
                <div className={`${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : message.type === 'danger' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'} border rounded-md p-3 mb-4`}>
                    {message.text}
                </div>
            )}

            {!showDesactivated && (
                <div className={cardClass}>
                    <h3 className="text-base font-semibold mb-4 text-primary">➕ Nouvel Enseignant</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="matricule" placeholder="Matricule *" onChange={handleChange} value={formData.matricule} required className={inputClass} />
                            <input name="email" type="email" placeholder="Email professionnel *" onChange={handleChange} value={formData.email} required className={inputClass} />
                            <input name="nom" placeholder="Nom *" onChange={handleChange} value={formData.nom} required className={inputClass} />
                            <input name="prenom" placeholder="Prénom *" onChange={handleChange} value={formData.prenom} required className={inputClass} />
                            <select name="grade" onChange={handleChange} value={formData.grade} className={inputClass}>
                                <option value="Professeur">Professeur</option>
                                <option value="MCF">Maître de Conférences</option>
                                <option value="Assistant">Assistant</option>
                            </select>
                            <select name="capacite" onChange={handleChange} value={formData.capacite} className={inputClass}>
                                <option value="3">Quota : 3 étudiants</option>
                                <option value="5">Quota : 5 étudiants</option>
                                <option value="10">Quota : 10 étudiants</option>
                            </select>
                            <input name="specialite" placeholder="Spécialité (ex: Intelligence Artificielle)" onChange={handleChange} value={formData.specialite} className={inputClass} />
                        </div>

                        <div className="mt-4">
                            <button type="submit" className={`bg-primary text-white ${buttonClass}`}>Enregistrer l'enseignant</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg p-4 shadow">
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr className={tableHeadClass}>
                            <th className="px-4 py-3">Matricule</th>
                            <th className="px-4 py-3">Nom & Prénom</th>
                            <th className="px-4 py-3">Grade</th>
                            <th className="px-4 py-3">Spécialité</th>
                            <th className="px-4 py-3">Capacité</th>
                            <th className="px-4 py-3">Statut</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEnseignants.length > 0 ? filteredEnseignants.map((ens) => (
                            <tr key={ens.id_enseignant} className="hover:bg-gray-50 transition">
                                <td className={tdClass}><strong>{ens.matricule}</strong></td>
                                <td className={tdClass}>
                                    <div className="font-semibold">{ens.nom} {ens.prenom}</div>
                                    <div className="text-sm text-gray-500">{ens.email}</div>
                                </td>
                                <td className={tdClass}>{getGradeBadge(ens.grade)}</td>
                                <td className={tdClass}>{ens.specialite || '—'}</td>
                                <td className={tdClass}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-2 bg-gray-100 rounded overflow-hidden"><div style={{ width: '0%' }} className="h-full bg-green-400"></div></div>
                                        <span className="text-sm font-bold">0/{ens.capacite_encadrement}</span>
                                    </div>
                                </td>
                                <td className={tdClass}>{getStatutBadge(ens.statut_enseignant)}</td>
                                <td className={tdClass}>
                                    {ens.statut_enseignant !== 'Inactif' ? (
                                        <>
                                            <button onClick={() => handleEdit(ens)} className="px-2 py-1 rounded bg-blue-50 text-blue-700 mr-2">✏️ Modifier</button>
                                            <button onClick={() => handleDesactivate(ens.id_enseignant)} className="px-2 py-1 rounded bg-yellow-50 text-yellow-700 mr-2">🚫 Désactiver</button>
                                            <button onClick={() => handleDelete(ens.id_enseignant)} className="px-2 py-1 rounded bg-red-50 text-red-700">🗑️ Supprimer</button>
                                        </>
                                    ) : (
                                        <button onClick={() => handleActivate(ens.id_enseignant)} className="px-2 py-1 rounded bg-green-50 text-green-700">✅ Réactiver</button>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" className="text-center p-10 text-gray-500">{showDesactivated ? 'Aucun enseignant désactivé.' : 'Aucun enseignant trouvé.'}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {showModal && editData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                        <h3 className="text-lg font-semibold text-primary">Modifier l'Enseignant</h3>
                        <form onSubmit={handleUpdate}>
                            <div className="grid gap-3 mt-3">
                                <input name="matricule" value={editData.matricule} onChange={handleEditChange} className={inputClass} placeholder="Matricule" />
                                <input name="nom" value={editData.nom} onChange={handleEditChange} className={inputClass} placeholder="Nom" />
                                <input name="prenom" value={editData.prenom} onChange={handleEditChange} className={inputClass} placeholder="Prénom" />
                                <input name="email" value={editData.email} onChange={handleEditChange} className={inputClass} placeholder="Email" />
                                <select name="grade" value={editData.grade} onChange={handleEditChange} className={inputClass}>
                                    <option value="Professeur">Professeur</option>
                                    <option value="MCF">Maître de Conférences</option>
                                    <option value="Assistant">Assistant</option>
                                </select>
                                <input name="specialite" value={editData.specialite || ''} onChange={handleEditChange} className={inputClass} placeholder="Spécialité" />
                                <input name="capacite_encadrement" type="number" value={editData.capacite_encadrement} onChange={handleEditChange} className={inputClass} placeholder="Capacité d'encadrement" />
                            </div>
                            <div className="mt-4 flex justify-end gap-2">
                                <button type="button" onClick={() => { setShowModal(false); setEditData(null); }} className="px-3 py-2 rounded bg-gray-200">Annuler</button>
                                <button type="submit" className="px-3 py-2 rounded bg-primary text-white">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Enseignants;
