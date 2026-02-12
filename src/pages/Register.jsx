import { useState } from "react";

const Register = ({ onGoToLogin }) => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    role: "ADMIN",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const styles = {
    container: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f7f6', fontFamily: '"Poppins", sans-serif' },
    card: { backgroundColor: '#FFFFFF', width: '400px', padding: '40px', textAlign: 'center', boxShadow: '0 0 20px 0 rgba(0, 0, 0, 0.2)', borderRadius: '10px', position: 'relative' },
    input: { background: '#f2f2f2', width: '100%', border: 0, borderRadius: '7px', margin: '0 0 12px', padding: '12px', boxSizing: 'border-box', fontSize: '14px', outline: 'none' },
    select: { background: '#f2f2f2', width: '100%', border: 'none', borderRadius: '7px', margin: '0 0 15px', padding: '12px', fontSize: '14px', color: '#666' },
    button: { textTransform: 'uppercase', background: '#234666', width: '100%', border: 0, padding: '15px', color: '#FFFFFF', borderRadius: '7px', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' },
    link: { color: '#234666', textDecoration: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
    successOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', zIndex: 10 }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true); // Active l'état de succès
        setTimeout(() => onGoToLogin(), 1500); // Redirige après 1.5s
      } else {
        const data = await res.json();
        setError(data.message || "Erreur lors de la création du compte");
      }
    } catch (err) {
      setError("Erreur serveur. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* OVERLAY DE SUCCÈS : Plus pro qu'un simple message */}
        {success && (
          <div style={styles.successOverlay}>
            <div style={{ fontSize: '50px', color: '#28a745', marginBottom: '10px' }}>✓</div>
            <h3 style={{ color: '#234666' }}>Compte créé !</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Préparation de la connexion...</p>
          </div>
        )}

        <h2 style={{ color: '#234666', marginBottom: '20px' }}>Création de compte</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" name="nom" placeholder="Nom" onChange={handleChange} style={styles.input} required />
            <input type="text" name="prenom" placeholder="Prénom" onChange={handleChange} style={styles.input} required />
          </div>
          <input type="email" name="email" placeholder="Email professionnel" onChange={handleChange} style={styles.input} required />
          <input type="password" name="password" placeholder="Mot de passe" onChange={handleChange} style={styles.input} required />
          
          <select name="role" value={formData.role} onChange={handleChange} style={styles.select}>
            <option value="ADMIN">Administrateur</option>
            <option value="GESTIONNAIRE">Gestionnaire du cycle</option>
            <option value="ENSEIGNANT">Enseignant</option>
            <option value="ETUDIANT">Étudiant</option>
          </select>

          <button 
            type="submit" 
            disabled={loading || success} 
            style={{...styles.button, background: (loading || success) ? '#ccc' : '#234666'}}
          >
            {loading ? "Traitement..." : "Créer le compte"}
          </button>
        </form>

        {error && (
          <p style={{ color: '#D34053', fontSize: '13px', marginTop: '15px', fontWeight: '500' }}>
            ⚠️ {error}
          </p>
        )}

        {!success && (
          <p style={{ marginTop: '20px' }}>
            <span onClick={onGoToLogin} style={styles.link}>Retour à la connexion</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;