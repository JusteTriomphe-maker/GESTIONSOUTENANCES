import { pool as db } from '../config/db.js';

// 1. Ajouter un enseignant (UC-GEns-01)
const createEnseignant = async (req, res) => {
    const { matricule, nom, prenom, email, grade, specialite, capacite_encadrement } = req.body;

    if (!matricule || !nom || !email) {
        return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    try {
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

// 3. Rechercher un enseignant (UC-GEns-02)
const searchEnseignants = async (req, res) => {
    const { query } = req.query;
    try {
        const [rows] = await db.query(
            `SELECT * FROM enseignants WHERE nom LIKE ? OR prenom LIKE ? OR matricule LIKE ? OR grade LIKE ? OR specialite LIKE ?`,
            [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 4. Modifier un enseignant (UC-GEns-03)
const updateEnseignant = async (req, res) => {
    const { id } = req.params;
    const { nom, prenom, email, grade, specialite, capacite_encadrement } = req.body;
    try {
        await db.query(
            `UPDATE enseignants SET nom = ?, prenom = ?, email = ?, grade = ?, specialite = ?, capacite_encadrement = ? WHERE id_enseignant = ?`,
            [nom, prenom, email, grade, specialite, capacite_encadrement, id]
        );
        res.json({ message: "Enseignant mis à jour avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 5. Supprimer un enseignant (UC-GEns-04)
const deleteEnseignant = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM enseignants WHERE id_enseignant = ?', [id]);
        res.json({ message: "Enseignant supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 6. Désactiver un enseignant (UC-GEns-05)
const desactivateEnseignant = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE enseignants SET statut_enseignant = "Inactif" WHERE id_enseignant = ?', [id]);
        res.json({ message: "Enseignant désactivé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 7. Activer un enseignant
const activateEnseignant = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE enseignants SET statut_enseignant = "Actif" WHERE id_enseignant = ?', [id]);
        res.json({ message: "Enseignant activé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export { createEnseignant, getAllEnseignants, searchEnseignants, updateEnseignant, deleteEnseignant, desactivateEnseignant, activateEnseignant };
