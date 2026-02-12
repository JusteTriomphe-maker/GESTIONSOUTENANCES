import { pool as db } from '../config/db.js';

// 1. Proposer un thème (UC-GTh-01)
const createTheme = async (req, res) => {
    const { titre, description, domaine, auteur, type_auteur } = req.body;

    if (!titre || !description) {
        return res.status(400).json({ message: "Titre et Description requis" });
    }

    try {
        const query = `
            INSERT INTO themes (titre, description, domaine, auteur, type_auteur) 
            VALUES (?, ?, ?, ?, ?)
        `;
        await db.query(query, [titre, description, domaine, auteur, type_auteur]);
        res.status(201).json({ message: "Thème proposé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 2. Lister tous les thèmes
const getAllThemes = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM themes ORDER BY date_proposition DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 3. Valider un thème (UC-GTh-02)
const validateTheme = async (req, res) => {
    const { id } = req.params;
    
    try {
        await db.query('UPDATE themes SET statut_theme = "Validé" WHERE id_theme = ?', [id]);
        res.json({ message: "Thème validé" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export { createTheme, getAllThemes, validateTheme };