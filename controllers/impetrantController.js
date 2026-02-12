import { pool as db } from '../config/db.js';

// 1. Ajouter un impétrant
const createImpetrant = async (req, res) => {
    const { matricule, nom, prenom, filiere, cycle, annee_academique } = req.body;

    if (!matricule || !nom || !prenom) {
        return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    try {
        // Vérifier si le matricule existe déjà
        const [check] = await db.query('SELECT * FROM impetrants WHERE matricule = ?', [matricule]);
        if (check.length > 0) {
            return res.status(409).json({ message: "Cet impétrant existe déjà" });
        }

        // Insertion
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

export { createImpetrant, getAllImpetrants };