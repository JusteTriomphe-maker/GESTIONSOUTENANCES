import { useState, useEffect } from 'react';

const GestionComptes = () => {
    const [users, setUsers] = useState([]); // Initialement un tableau vide
    const [formData, setFormData] = useState({ nom: '', email: '', password: '', role: 'ETUDIANT' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(''); // Pour afficher l'erreur serveur

    const colors = {
        primary: '#234666',
        success: '#10B981',
        danger: '#D34053',
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            // Vérification cruciale : est-ce que c'est bien du JSON ?
            if (!res.ok) throw new Error("Erreur serveur");
            
            const data = await res.json();
            
            // Sécurité : si ce n'est pas un tableau, on met un tableau vide
            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                console.error("Format de données invalide", data);
                setUsers([]); 
            }
        } catch (err) {
            console.error(err);
            setError("Impossible de charger les utilisateurs (Vérifiez la console Backend)");
            setUsers([]); // Évite le crash .map
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/users/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (res.ok) {
                alert("Utilisateur créé !"); // Simple alerte pour confirmer
                setFormData({ nom: '', email: '', password: '', role: 'ETUDIANT' });
                fetchUsers();
            } else {
                setError(data.message || "Erreur création");
            }
        } catch (err) {
            setError("Erreur de connexion au serveur");
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        input: { padding: '10px', borderRadius: '6px', border: '1px solid #E2E8F0', width: '100%', boxSizing: 'border-box', marginBottom: '10px' }
    };

    return (
        <div>
            <h2 style={{ marginBottom: '20px', color: colors.primary }}>🔐 Gestion des Comptes</h2>

            {error && <div style={{ color: colors.danger, background: '#FEE2E2', padding: '10px', borderRadius: '6px', marginBottom: '20px' }}>{error}</div>}

            {/* Formulaire */}
            <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ marginTop: 0 }}>Nouvel Utilisateur</h4>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', alignItems: 'end' }}>
                    <input name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} required style={styles.input} />
                    <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={styles.input} />
                    <input name="password" type="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} required style={styles.input} />
                    <select name="role" value={formData.role} onChange={handleChange} style={styles.input}>
                        <option value="ADMIN">ADMIN</option>
                        <option value="GESTIONNAIRE">GESTIONNAIRE</option>
                        <option value="ENSEIGNANT">ENSEIGNANT</option>
                        <option value="ETUDIANT">ETUDIANT</option>
                    </select>
                    <button type="submit" disabled={loading} style={{ gridColumn: '1 / -1', padding: '10px', background: colors.success, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {loading ? 'Création...' : 'Créer'}
                    </button>
                </form>
            </div>

            {/* Liste */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#F8FAFC', textAlign: 'left' }}>
                            <th style={{ padding: '12px' }}>Nom</th>
                            <th style={{ padding: '12px' }}>Email</th>
                            <th style={{ padding: '12px' }}>Rôle</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Aucun utilisateur ou erreur de chargement.</td></tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '12px' }}>{u.nom}</td>
                                    <td style={{ padding: '12px' }}>{u.email}</td>
                                    <td style={{ padding: '12px' }}>{u.role}</td>
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