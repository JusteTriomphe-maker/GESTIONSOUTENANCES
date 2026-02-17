import { useState, useEffect } from 'react';
import { apiCall } from '../config/api.js';

const Memoires = () => {
    const [formData, setFormData] = useState({ id_attribution: '' });
    const [attributions, setAttributions] = useState([]);
    const [memoires, setMemoires] = useState([]);
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');

    // Charger les attributions
    const fetchAttributions = async () => {
        try {
            const res = await apiCall('/api/attributions');
            const data = await res.json();
            setAttributions(data);
        } catch (error) { 
            console.error(error); 
        }
    };

    // Charger les mémoires
    const fetchMemoires = async () => {
        try {
            const res = await apiCall('/api/memoires');
            const data = await res.json();
            setMemoires(data);
        } catch (error) { 
            console.error(error); 
        }
    };

    useEffect(() => {
        fetchAttributions();
        fetchMemoires();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!file) {
            setMessage("❌ Veuillez sélectionner un fichier PDF.");
            return;
        }

        const data = new FormData();
        data.append('id_attribution', formData.id_attribution);
        data.append('fichier', file);

        try {
            const res = await apiCall('/api/memoires/add', { method: 'POST', body: data });
            const result = await res.json();

            if (res.ok) {
                setMessage("✅ Mémoire déposé avec succès !");
                setFile(null);
                setFormData({ id_attribution: '' });
                fetchMemoires();
            } else {
                setMessage("❌ Erreur : " + (result.message || 'Erreur'));
            }
        } catch (error) {
            setMessage("❌ Erreur serveur");
        }
    };

    // ✅ Valider un mémoire
    const handleValidate = async (id) => {
        if (!window.confirm("Voulez-vous vraiment valider ce mémoire ?")) return;
        try {
            const res = await apiCall(`/api/memoires/validate/${id}`, { method: 'PUT' });
            if (res.ok) fetchMemoires();
            else alert("Erreur validation");
        } catch (error) {
            alert("Erreur validation");
        }
    };

    // ❌ Rejeter un mémoire
    const handleReject = async (id) => {
        if (!window.confirm("Voulez-vous vraiment rejeter ce mémoire ? L'étudiant devra le redéposer.")) return;
        try {
            const res = await apiCall(`/api/memoires/reject/${id}`, { method: 'PUT' });
            if (res.ok) fetchMemoires();
            else alert("Erreur rejet");
        } catch (error) {
            alert("Erreur rejet");
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Dépôt de Mémoires (PDF)</h2>

            <div className="mb-6 border border-green-200 bg-green-50 rounded-lg p-6">
                <h3 className="font-semibold mb-3">Déposer un nouveau mémoire</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2">Sélectionner l'Étudiant (Attribution) :</label>
                        <select name="id_attribution" onChange={handleChange} value={formData.id_attribution} required className="px-3 py-2 border rounded-md w-full md:w-1/2">
                            <option value="">-- Choisir --</option>
                            {attributions.map(attr => (
                                <option key={attr.id_attribution} value={attr.id_attribution}>
                                    {attr.nom_etudiant} {attr.prenom_etudiant} ({attr.theme_titre})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">Fichier PDF (Max 100Mo) :</label>
                        <input type="file" accept="application/pdf" onChange={handleFileChange} required className="w-full" />
                    </div>

                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md">Déposer le Mémoire</button>

                    {message && <p className="mt-3 font-semibold">{message}</p>}
                </form>
            </div>

            <h3 className="text-lg font-semibold mb-3">Liste des Mémoires ({memoires.length})</h3>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y">
                    <thead className="bg-green-600 text-white">
                        <tr>
                            <th className="px-4 py-3 text-left">Étudiant</th>
                            <th className="px-4 py-3 text-left">Thème</th>
                            <th className="px-4 py-3 text-left">Statut</th>
                            <th className="px-4 py-3 text-left">Fichier</th>
                            <th className="px-4 py-3 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {memoires.map((mem) => (
                            <tr key={mem.id_memoire} className="hover:bg-gray-50">
                                <td className="px-4 py-3">{mem.nom_etudiant} {mem.prenom_etudiant}</td>
                                <td className="px-4 py-3">{mem.titre}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded font-bold ${mem.statut_validation === 'Validé' ? 'bg-green-600 text-white' : mem.statut_validation === 'Rejeté' ? 'bg-red-600 text-white' : 'bg-yellow-300 text-black'}`}>
                                        {mem.statut_validation}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <a href={`/uploads/${mem.nom_fichier}`} target="_blank" rel="noreferrer" className="text-blue-600">📄 Télécharger</a>
                                </td>
                                <td className="px-4 py-3">
                                    {mem.statut_validation === 'En attente' ? (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleValidate(mem.id_memoire)} className="px-3 py-1 bg-green-600 text-white rounded">✓ Valider</button>
                                            <button onClick={() => handleReject(mem.id_memoire)} className="px-3 py-1 bg-red-600 text-white rounded">✗ Rejeter</button>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic">Terminé</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Memoires;
