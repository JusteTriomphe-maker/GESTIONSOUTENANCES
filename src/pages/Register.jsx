import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { apiCall } from '../config/api.js';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    role: "IMPETRANT",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Utilisation de classes Tailwind pour le style (desktop-first)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await apiCall("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true); // Active l'état de succès
        setTimeout(() => navigate('/login'), 1500); // Redirige après 1.5s
      } else {
        const data = await res.json();
        setError(data.message || "Erreur lors de la création du compte");
      }
    } catch (err) {
      console.error('Erreur register:', err);
      setError("Erreur serveur - vérifiez que le backend est actif sur http://localhost:5000");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
      <div className="relative bg-white w-full max-w-md p-10 text-center shadow-lg rounded-lg">

        {success && (
          <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center rounded-lg z-10">
            <div className="text-5xl text-emerald-500 mb-2">✓</div>
            <h3 className="text-[#234666] text-lg font-semibold">Compte créé !</h3>
            <p className="text-gray-600 text-sm">Préparation de la connexion...</p>
          </div>
        )}

        <h2 className="text-[#234666] text-2xl mb-5">Création de compte</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-3">
            <input type="text" name="nom" placeholder="Nom" onChange={handleChange} className="bg-gray-100 w-full rounded-md p-3 text-sm outline-none" required />
            <input type="text" name="prenom" placeholder="Prénom" onChange={handleChange} className="bg-gray-100 w-full rounded-md p-3 text-sm outline-none" required />
          </div>

          <input type="email" name="email" placeholder="Email professionnel" onChange={handleChange} className="bg-gray-100 w-full rounded-md p-3 text-sm outline-none" required />
          <input type="password" name="password" placeholder="Mot de passe" onChange={handleChange} className="bg-gray-100 w-full rounded-md p-3 text-sm outline-none" required />

          <select name="role" value={formData.role} onChange={handleChange} className="bg-gray-100 w-full rounded-md p-3 text-sm text-gray-600">
            <option value="IMPETRANT">Impétrant (Étudiant)</option>
            <option value="ENSEIGNANT">Enseignant / Directeur</option>
            <option value="COORDONNATEUR">Coordonnateur des cycles</option>
            <option value="PRESIDENT_JURY">Président du Jury</option>
            <option value="MEMBRE_JURY">Membre du Jury</option>
            <option value="COMMISSION_VALIDATION">Commission de Validation</option>
            <option value="PARTENAIRE">Partenaire institutionnel</option>
            <option value="BIBLIOTHECAIRE">Bibliothécaire</option>
            <option value="ADMIN">Administrateur système</option>
          </select>

          <button 
            type="submit" 
            disabled={loading || success} 
            className={`uppercase w-full py-3 rounded-md text-white font-bold transition ${loading || success ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#234666] hover:brightness-110'}`}
          >
            {loading ? "Traitement..." : "Créer le compte"}
          </button>
        </form>

        {error && (
          <p className="text-red-600 text-sm mt-4 font-medium">⚠️ {error}</p>
        )}

        {!success && (
          <p className="mt-5 text-sm">
            Vous avez un compte ? <Link to="/login" className="text-[#234666] font-semibold">Connectez-vous</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;