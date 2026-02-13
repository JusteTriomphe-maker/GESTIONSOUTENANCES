import { useState, useEffect } from 'react';

const MonDirecteur = ({ user }) => {
    const [directeur, setDirecteur] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDirecteur = async () => {
        try {
            // On essaie de récupérer l'attribution pour cet étudiant
            // On suppose que user.id est l'ID de l'étudiant
            const res = await fetch(`/api/attributions/etudiant/${user.id}`);
            
            if (!res.ok) {
                throw new Error(`Erreur HTTP: ${res.status}`);
            }

            const data = await res.json();
            
            if (data && data.length > 0) {
                setDirecteur(data[0]);
            } else {
                setDirecteur(null); // Pas de directeur
            }
        } catch (err) {
            console.error(err);
            setError("Impossible de charger les infos du directeur.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(user && user.id) fetchDirecteur();
    }, [user]);

    if (loading) return <div style={{padding:'20px', textAlign:'center'}}>Chargement...</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
            <h2 style={{ marginBottom: '25px', color: '#1C2434', textAlign: 'center' }}>Mon Directeur de Mémoire</h2>
            
            {error && <div style={{color:'red', textAlign:'center', marginBottom:'20px'}}>{error}</div>}

            {!directeur ? (
                <div style={{textAlign:'center', color:'#888', padding:'40px', background:'white', borderRadius:'12px', border:'1px solid #E2E8F0'}}>
                    <p><strong>Aucun directeur attribué.</strong></p>
                    <p style={{fontSize:'13px'}}>Veuillez contacter l'administration ou attendre qu'un thème vous soit attribué.</p>
                </div>
            ) : (
                <div style={{ background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div style={{ width: '60px', height: '60px', background: '#E0E7FF', borderRadius: '50%', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👨‍🏫</div>
                        <h3 style={{ margin: 0, color: '#1C2434' }}>{directeur.nom_enseignant} {directeur.prenom_enseignant}</h3>
                    </div>
                    <p><strong>Email :</strong> {directeur.email_enseignant}</p>
                </div>
            )}
        </div>
    );
};

export default MonDirecteur;