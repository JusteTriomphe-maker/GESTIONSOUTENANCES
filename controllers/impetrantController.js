import { pool as db } from '../config/db.js';

// 1. Ajouter un impétrant (UC-GImp-01)
const createImpetrant = async (req, res) => {
    const { matricule, nom, prenom, filiere, cycle, annee_academique } = req.body;

    if (!matricule || !nom || !prenom) {
        return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    try {
        const [check] = await db.query('SELECT * FROM impetrants WHERE matricule = ?', [matricule]);
        if (check.length > 0) {
            return res.status(409).json({ message: "Cet impétrant existe déjà" });
        }

        const query = `
            INSERT INTO impetrants (matricule, nom, prenom, filiere, cycle, annee_academique) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await db.query(query, [matricule, nom, prenom, filiere, cycle, annee_academique]);

        res.status(201).json({ message: "Impétrant ajouté avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 2. Lister tous les impétrants
const getAllImpetrants = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM impetrants ORDER BY date_creation DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 3. Rechercher un impétrant (UC-GImp-02)
const searchImpetrants = async (req, res) => {
    const { query } = req.query;
    try {
        const [rows] = await db.query(
            `SELECT * FROM impetrants WHERE nom LIKE ? OR prenom LIKE ? OR matricule LIKE ? OR filiere LIKE ?`,
            [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 4. Modifier un impétrant (UC-GImp-03)
const updateImpetrant = async (req, res) => {
    const { id } = req.params;
    const { nom, prenom, filiere, cycle, annee_academique } = req.body;
    try {
        await db.query(
            `UPDATE impetrants SET nom = ?, prenom = ?, filiere = ?, cycle = ?, annee_academique = ? WHERE id_impetrant = ?`,
            [nom, prenom, filiere, cycle, annee_academique, id]
        );
        res.json({ message: "Impétrant mis à jour avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 5. Supprimer un impétrant (UC-GImp-04)
const deleteImpetrant = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM impetrants WHERE id_impetrant = ?', [id]);
        res.json({ message: "Impétrant supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 6. Désactiver un impétrant (UC-GImp-05)
const desactivateImpetrant = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE impetrants SET statut_impetrant = "Inactif" WHERE id_impetrant = ?', [id]);
        res.json({ message: "Impétrant désactivé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 7. Activer un impétrant
const activateImpetrant = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE impetrants SET statut_impetrant = "Actif" WHERE id_impetrant = ?', [id]);
        res.json({ message: "Impétrant activé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export { createImpetrant, getAllImpetrants, searchImpetrants, updateImpetrant, deleteImpetrant, desactivateImpetrant, activateImpetrant };
