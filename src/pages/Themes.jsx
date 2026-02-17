import { useState, useEffect } from 'react';
import { apiCall } from '../config/api.js';

const Themes = ({ user }) => {
    const [formData, setFormData] = useState({ titre: '', description: '', domaine: 'GL', auteur: '', type_auteur: 'Enseignant' });
    const [themes, setThemes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatut, setFilterStatut] = useState('all');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showModal, setShowModal] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [reformulationComment, setReformulationComment] = useState('');

    const fetchThemes = async () => {
        try {
            const res = await apiCall('/api/themes');
            const data = await res.json();
            setThemes(data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        fetchThemes();
        if (user) setFormData(prev => ({ ...prev, auteur: `${user.nom} ${user.prenom}` }));
    }, [user]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: 'Traitement...', type: 'info' });
        try {
            const res = await apiCall('/api/themes/add', { method: 'POST', body: JSON.stringify(formData) });
            const data = await res.json();
            if (res.ok) {
                setMessage({ text: '✅ Thème proposé avec succès !', type: 'success' });
                setFormData({ titre: '', description: '', domaine: 'GL', auteur: user ? `${user.nom} ${user.prenom}` : '', type_auteur: 'Enseignant' });
                fetchThemes();
            } else {
                setMessage({ text: '❌ Erreur : ' + (data.message || 'Erreur'), type: 'danger' });
            }
        } catch (error) {
            setMessage({ text: '❌ Erreur serveur', type: 'danger' });
        }
    };

    const handleValidate = async (id) => {
        try {
            const res = await apiCall(`/api/themes/validate/${id}`, { method: 'PUT' });
            if (res.ok) { setMessage({ text: '✅ Thème validé avec succès !', type: 'success' }); fetchThemes(); }
        } catch (error) { alert('Erreur lors de la validation'); }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir rejeter ce thème ?")) return;
        try {
            const res = await apiCall(`/api/themes/reject/${id}`, { method: 'PUT' });
            if (res.ok) { setMessage({ text: '❌ Thème rejeté', type: 'danger' }); fetchThemes(); }
        } catch (error) { alert('Erreur lors du rejet'); }
    };

    const handleRequestReformulation = (theme) => { setSelectedTheme(theme); setShowModal(true); };

    const submitReformulation = async () => {
        if (!reformulationComment.trim()) { alert('Veuillez ajouter un commentaire pour la reformulation'); return; }
        try {
            const res = await apiCall(`/api/themes/reformulate/${selectedTheme.id_theme}`, { method: 'PUT', body: JSON.stringify({ comment: reformulationComment }) });
            if (res.ok) { setMessage({ text: '📝 Demande de reformulation envoyée !', type: 'warning' }); setShowModal(false); setReformulationComment(''); fetchThemes(); }
        } catch (error) { alert('Erreur lors de la demande de reformulation'); }
    };

    const filteredThemes = themes.filter(th => {
        if (filterStatut !== 'all' && th.statut_theme !== filterStatut) return false;
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        return th.titre?.toLowerCase().includes(s) || th.description?.toLowerCase().includes(s) || th.auteur?.toLowerCase().includes(s) || th.domaine?.toLowerCase().includes(s);
    });

    const stats = {
        total: themes.length,
        valide: themes.filter(t => t.statut_theme === 'Validé').length,
        soumis: themes.filter(t => t.statut_theme === 'Soumis').length,
        rejete: themes.filter(t => t.statut_theme === 'Rejeté').length,
        reformulation: themes.filter(t => t.statut_theme === 'En reformulation').length
    };

    const cardClass = 'bg-white rounded-lg shadow p-6 mb-6';
    const inputClass = 'w-full px-3 py-2 border rounded-md mb-2';
    const labelClass = 'text-sm font-semibold text-gray-700 mb-2 block';
    const badgeClass = (statut) => statut === 'Validé' ? 'bg-green-100 text-green-700' : statut === 'Rejeté' ? 'bg-red-100 text-red-700' : statut === 'En reformulation' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700';

    return (
        <div className="p-8">
            <h2 className="text-xl font-semibold mb-6">📝 Gestion des Thèmes de Mémoire</h2>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
                <div className={cardClass + ' text-center'}>
                    <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                    <div className="text-sm text-gray-500">Total</div>
                </div>
                <div className={cardClass + ' text-center'}>
                    <div className="text-2xl font-bold text-green-600">{stats.valide}</div>
                    <div className="text-sm text-gray-500">Validés</div>
                </div>
                <div className={cardClass + ' text-center'}>
                    <div className="text-2xl font-bold text-yellow-600">{stats.soumis}</div>
                    <div className="text-sm text-gray-500">En attente</div>
                </div>
                <div className={cardClass + ' text-center'}>
                    <div className="text-2xl font-bold text-blue-600">{stats.reformulation}</div>
                    <div className="text-sm text-gray-500">En reformulation</div>
                </div>
                <div className={cardClass + ' text-center'}>
                    <div className="text-2xl font-bold text-red-600">{stats.rejete}</div>
                    <div className="text-sm text-gray-500">Rejetés</div>
                </div>
            </div>

            {message.text && (
                <div className={`${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : message.type === 'danger' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'} border rounded-md p-3 mb-4`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                    <div className={cardClass}>
                        <h3 className="text-base font-semibold mb-3">➕ Proposer un nouveau thème</h3>
                        <form onSubmit={handleSubmit}>
                            <input name="titre" placeholder="Titre du thème *" onChange={handleChange} value={formData.titre} required className={inputClass} />
                            <textarea name="description" placeholder="Description du sujet... *" onChange={handleChange} value={formData.description} required rows="4" className={inputClass} />

                            <label className={labelClass}>DOMAINE D'ÉTUDE</label>
                            <select name="domaine" onChange={handleChange} value={formData.domaine} className={inputClass}>
                                <option value="GL">Génie Logiciel (GL)</option>
                                <option value="CS">Cybersécurité (CS)</option>
                                <option value="SR">Systèmes et Réseaux (SR)</option>
                                <option value="ASR">Administration Système (ASR)</option>
                                <option value="AP">Administration Publique (AP)</option>
                            </select>

                            <label className={labelClass}>ORIGINE</label>
                            <select name="type_auteur" onChange={handleChange} value={formData.type_auteur} className={inputClass}>
                                <option value="Enseignant">Enseignant</option>
                                <option value="Etudiant">Étudiant</option>
                                <option value="Partenaire">Entreprise / Partenaire</option>
                            </select>

                            <input name="auteur" placeholder="Nom de l'auteur *" onChange={handleChange} value={formData.auteur} required className={inputClass} />

                            <button type="submit" className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md font-bold mt-2">Soumettre un thème</button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="flex gap-3 mb-4">
                        <input type="text" placeholder="🔍 Rechercher un thème..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-3 py-2 border rounded-md w-full md:w-72" />
                        <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-3 py-2 border rounded-md w-48">
                            <option value="all">Tous les statuts</option>
                            <option value="Soumis">En attente</option>
                            <option value="Validé">Validés</option>
                            <option value="Rejeté">Rejetés</option>
                            <option value="En reformulation">En reformulation</option>
                        </select>
                    </div>

                    <div className={cardClass + ' p-0'}>
                        <div className="px-5 py-4 border-b">
                            <h3 className="text-lg">Thèmes enregistrés ({filteredThemes.length})</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {filteredThemes.length > 0 ? filteredThemes.map((th) => (
                                <div key={th.id_theme} className="px-5 py-4 border-b flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`px-2 py-1 rounded-full text-sm font-bold ${badgeClass(th.statut_theme)}`}>{th.statut_theme}</span>
                                            <small className="font-bold text-gray-600">{th.domaine}</small>
                                        </div>
                                        <div className="font-bold text-gray-800 text-lg">{th.titre}</div>
                                        <div className="text-sm text-gray-600 mt-1">Par: <strong>{th.auteur}</strong> ({th.type_auteur})</div>
                                        {th.description && <div className="text-sm text-gray-600 mt-2 italic">"{th.description.substring(0, 100)}..."</div>}
                                        {th.comment_reformulation && <div className="text-sm text-blue-700 mt-2 p-2 bg-blue-50 rounded">📝 Commentaire: {th.comment_reformulation}</div>}
                                    </div>

                                    <div className="ml-4 flex flex-col gap-2">
                                        {th.statut_theme === 'Soumis' && (
                                            <>
                                                <button onClick={() => handleValidate(th.id_theme)} className="px-3 py-1 bg-green-600 text-white rounded">✅ Valider</button>
                                                <button onClick={() => handleRequestReformulation(th)} className="px-3 py-1 bg-blue-600 text-white rounded">📝 Reformuler</button>
                                                <button onClick={() => handleReject(th.id_theme)} className="px-3 py-1 bg-red-600 text-white rounded">❌ Rejeter</button>
                                            </>
                                        )}
                                        {th.statut_theme === 'En reformulation' && <button onClick={() => handleValidate(th.id_theme)} className="px-3 py-1 bg-green-600 text-white rounded">✅ Valider</button>}
                                        {th.statut_theme === 'Validé' && <span className="text-green-600 text-2xl">✓</span>}
                                        {th.statut_theme === 'Rejeté' && <span className="text-red-600 text-2xl">✕</span>}
                                    </div>
                                </div>
                            )) : (
                                <div className="p-10 text-center text-gray-500">Aucun thème trouvé.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showModal && selectedTheme && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold">Demander une reformulation</h3>
                        <p className="text-sm text-gray-600">Thème: <strong>{selectedTheme.titre}</strong></p>
                        <textarea placeholder="Expliquez les modifications à apporter..." value={reformulationComment} onChange={(e) => setReformulationComment(e.target.value)} rows="4" className="w-full px-3 py-2 border rounded-md mt-3" />
                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => { setShowModal(false); setReformulationComment(''); }} className="px-4 py-2 bg-gray-300 rounded">Annuler</button>
                            <button onClick={submitReformulation} className="px-4 py-2 bg-blue-600 text-white rounded">Envoyer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Themes;
