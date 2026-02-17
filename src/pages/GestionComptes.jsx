import { useState, useEffect } from 'react';
import { apiCall } from '../config/api.js';

const GestionComptes = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({ nom: '', email: '', password: '', role: 'ETUDIANT' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await apiCall('/api/users');
            if (!res.ok) throw new Error('Erreur serveur');
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError('Impossible de charger les utilisateurs (Vérifiez la console Backend)');
            setUsers([]);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await apiCall('/api/users/add', { method: 'POST', body: JSON.stringify(formData) });
            const data = await res.json();
            if (res.ok) {
                alert('Utilisateur créé !');
                setFormData({ nom: '', email: '', password: '', role: 'ETUDIANT' });
                fetchUsers();
            } else {
                setError(data.message || 'Erreur création');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h2 className="text-xl font-semibold mb-4">🔐 Gestion des Comptes</h2>

            {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700">{error}</div>}

            <div className="bg-gray-50 p-4 rounded-lg border mb-6">
                <h4 className="mb-3 font-semibold">Nouvel Utilisateur</h4>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <input name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} required className="px-3 py-2 border rounded" />
                    <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="px-3 py-2 border rounded" />
                    <input name="password" type="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} required className="px-3 py-2 border rounded" />
                    <select name="role" value={formData.role} onChange={handleChange} className="px-3 py-2 border rounded">
                        <option value="ADMIN">ADMIN</option>
                        <option value="GESTIONNAIRE">GESTIONNAIRE</option>
                        <option value="ENSEIGNANT">ENSEIGNANT</option>
                        <option value="ETUDIANT">ETUDIANT</option>
                        <option value="PRESIDENT_JURY">PRÉSIDENT DU JURY</option>
                        <option value="MEMBRE_JURY">MEMBRE DU JURY</option>
                        <option value="COMMISSION">COMMISSION DE VALIDATION</option>
                        <option value="PARTENAIRE">PARTENAIRE</option>
                        <option value="BIBLIOTHECAIRE">BIBLIOTHÉCAIRE</option>
                    </select>
                    <button type="submit" disabled={loading} className="md:col-span-4 px-4 py-2 bg-green-600 text-white rounded font-bold">
                        {loading ? 'Création...' : 'Créer'}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-lg border overflow-hidden">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-50 text-left">
                            <th className="px-4 py-3">Nom</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Rôle</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr><td colSpan="3" className="p-6 text-center text-gray-500">Aucun utilisateur ou erreur de chargement.</td></tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u.id} className="border-b">
                                    <td className="px-4 py-3">{u.nom}</td>
                                    <td className="px-4 py-3">{u.email}</td>
                                    <td className="px-4 py-3">{u.role}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GestionComptes;