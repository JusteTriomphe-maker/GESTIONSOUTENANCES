import { useState, useEffect } from 'react';

const Memoires = () => {
    const [formData, setFormData] = useState({ id_attribution: '' });
    const [attributions, setAttributions] = useState([]);
    const [memoires, setMemoires] = useState([]);
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');

    // Charger les attributions
    const fetchAttributions = async () => {
        try {
            const res = await fetch('/api/attributions');
            const data = await res.json();
            setAttributions(data);
        } catch (error) { 
            console.error(error); 
        }
    };

    // Charger les mémoires
    const fetchMemoires = async () => {
        try {
            const res = await fetch('/api/memoires');
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
            const res = await fetch('/api/memoires/add', {
                method: 'POST',
                body: data
            });

            const result = await res.json();

            if (res.ok) {
                setMessage("✅ Mémoire déposé avec succès !");
                setFile(null);
                setFormData({ id_attribution: '' });
                fetchMemoires();
            } else {
                setMessage("❌ Erreur : " + result.message);
            }
        } catch (error) {
            setMessage("❌ Erreur serveur");
        }
    };

    // ✅ Valider un mémoire
    const handleValidate = async (id) => {
        if (!window.confirm("Voulez-vous vraiment valider ce mémoire ?")) return;
        try {
            const res = await fetch(`/api/memoires/validate/${id}`, { method: 'PUT' });
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
            const res = await fetch(`/api/memoires/reject/${id}`, { method: 'PUT' });
            if (res.ok) fetchMemoires();
            else alert("Erreur rejet");
        } catch (error) { 
            alert("Erreur rejet"); 
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
            <h2>Dépôt de Mémoires (PDF)</h2>
            
            {/* Formulaire */}
            <div style={{ border: '1px solid #28a745', padding: '20px', borderRadius: '10px', marginBottom: '30px', backgroundColor: '#e8f5e9' }}>
                <h3>Déposer un nouveau mémoire</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Sélectionner l'Étudiant (Attribution) :</label>
                        <select 
                            name="id_attribution" 
                            onChange={handleChange} 
                            value={formData.id_attribution} 
                            required 
                            style={{ marginLeft: '10px', padding: '8px' }}
                        >
                            <option value="">-- Choisir --</option>
                            {attributions.map(attr => (
                                <option key={attr.id_attribution} value={attr.id_attribution}>
                                    {attr.nom_etudiant} {attr.prenom_etudiant} ({attr.theme_titre})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Fichier PDF (Max 100Mo) :</label>
                        <input 
                            type="file" 
                            accept="application/pdf" 
                            onChange={handleFileChange} 
                            required 
                            style={{ marginLeft: '10px' }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        Déposer le Mémoire
                    </button>

                    {message && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{message}</p>}
                </form>
            </div>

            {/* Liste */}
            <h3>Liste des Mémoires ({memoires.length})</h3>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                
                <thead style={{ backgroundColor: '#28a745', color: 'white' }}>
                    <tr>
                        <th>Étudiant</th>
                        <th>Thème</th>
                        <th>Statut</th>
                        <th>Fichier</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {memoires.map((mem) => (
                        <tr key={mem.id_memoire}>
                            <td>{mem.nom_etudiant} {mem.prenom_etudiant}</td>
                            <td>{mem.titre}</td>
                            <td>
                                <span style={{ 
                                    padding: '5px 10px', 
                                    borderRadius: '5px', 
                                    backgroundColor: mem.statut_validation === 'Validé' 
                                        ? '#28a745' 
                                        : (mem.statut_validation === 'Rejeté' 
                                            ? '#dc3545' 
                                            : '#ffc107'),
                                    color: mem.statut_validation === 'Validé' ? 'white' : 'black',
                                    fontWeight: 'bold'
                                }}>
                                    {mem.statut_validation}
                                </span>
                            </td>
                            <td>
                                <a 
                                    href={`/uploads/${mem.nom_fichier}`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    style={{ color: '#007bff' }}
                                >
                                    📄 Télécharger
                                </a>
                            </td>
                            <td>
                                {mem.statut_validation === 'En attente' && (
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button 
                                            onClick={() => handleValidate(mem.id_memoire)} 
                                            style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                        >
                                            ✓ Valider
                                        </button>
                                        <button 
                                            onClick={() => handleReject(mem.id_memoire)} 
                                            style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                        >
                                            ✗ Rejeter
                                        </button>
                                    </div>
                                )}

                                {mem.statut_validation !== 'En attente' && (
                                    <span style={{ color: '#aaa', fontStyle: 'italic' }}>
                                        Terminé
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>

            </table>
        </div>
    );
};

export default Memoires;
