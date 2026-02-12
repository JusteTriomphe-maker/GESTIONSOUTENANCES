import { pool as db } from '../config/db.js';

// 1. Ajouter un enseignant (UC-GEns-01)
const createEnseignant = async (req, res) => {
    const { matricule, nom, prenom, email, grade, specialite, capacite_encadrement } = req.body;

    if (!matricule || !nom || !email) {
        return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    try {
        // Vérification doublon (matricule ou email)
        const [check] = await db.query('SELECT * FROM enseignants WHERE matricule = ? OR email = ?', [matricule, email]);
        if (check.length > 0) {
            return res.status(409).json({ message: "Un enseignant avec ce matricule ou cet email existe déjà" });
        }

        const query = `
            INSERT INTO enseignants (matricule, nom, prenom, email, grade, specialite, capacite_encadrement) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(query, [matricule, nom, prenom, email, grade, specialite, capacite_encadrement || 5]);

        res.status(201).json({ message: "Enseignant ajouté avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 2. Lister tous les enseignants
const getAllEnseignants = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM enseignants ORDER BY date_creation DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export { createEnseignant, getAllEnseignants };