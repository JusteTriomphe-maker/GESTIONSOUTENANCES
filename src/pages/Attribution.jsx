import { useState, useEffect } from 'react';

const Attribution = () => {
    const [formData, setFormData] = useState({ id_impetrant: '', id_enseignant: '', id_theme: '' });
    const [options, setOptions] = useState({ impetrants: [], enseignants: [], themes: [] });
    const [attributions, setAttributions] = useState([]);
    const [message, setMessage] = useState('');

    // Charger les données du formulaire (Dropdowns)
    const fetchOptions = async () => {
        try {
            const res = await fetch('/api/attributions/form-data');
            const data = await res.json();
            setOptions(data);
        } catch (error) { console.error(error); }
    };

    // Charger la liste des attributions
    const fetchAttributions = async () => {
        try {
            const res = await fetch('/api/attributions');
            const data = await res.json();
            setAttributions(data);
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
        try {
            const res = await fetch('/api/attributions/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                setMessage("✅ Attribution réussie !");
                setFormData({ id_impetrant: '', id_enseignant: '', id_theme: '' });
                fetchAttributions();
            } else {
                setMessage("❌ Erreur : " + data.message);
            }
        } catch (error) {
            setMessage("❌ Erreur serveur");
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2>Attribution des Directeurs de Mémoire</h2>
            
            {/* Formulaire */}
            <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px', marginBottom: '30px', backgroundColor: '#f0f8ff' }}>
                <h3>Nouvelle Attribution</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        <select name="id_impetrant" onChange={handleChange} value={formData.id_impetrant} required style={{ padding: '10px' }}>
                            <option value="">-- Sélectionner un Impétrant --</option>
                            {options.impetrants.map(imp => (
                                <option key={imp.id_impetrant} value={imp.id_impetrant}>
                                    {imp.nom} {imp.prenom}
                                </option>
                            ))}
                        </select>

                        <select name="id_enseignant" onChange={handleChange} value={formData.id_enseignant} required style={{ padding: '10px' }}>
                            <option value="">-- Sélectionner un Enseignant --</option>
                            {options.enseignants.map(ens => (
                                <option key={ens.id_enseignant} value={ens.id_enseignant}>
                                    {ens.nom} {ens.prenom}
                                </option>
                            ))}
                        </select>

                        <select name="id_theme" onChange={handleChange} value={formData.id_theme} required style={{ padding: '10px' }}>
                            <option value="">-- Sélectionner un Thème Validé --</option>
                            {options.themes.map(th => (
                                <option key={th.id_theme} value={th.id_theme}>
                                    {th.titre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        Attribuer
                    </button>
                    {message && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{message}</p>}
                </form>
            </div>

            {/* Liste */}
            <h3>Attributions en cours ({attributions.length})</h3>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#007bff', color: 'white' }}>
                    <tr>
                        <th>Étudiant</th>
                        <th>Directeur</th>
                        <th>Thème Attribué</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {attributions.map((attr) => (
                        <tr key={attr.id_attribution}>
                            <td>{attr.nom_etudiant} {attr.prenom_etudiant}</td>
                            <td>{attr.nom_ens} {attr.prenom_ens}</td>
                            <td>{attr.theme_titre}</td>
                            <td>{new Date(attr.date_attribution).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Attribution;