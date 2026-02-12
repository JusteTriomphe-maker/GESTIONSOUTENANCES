import { pool as db } from '../config/db.js';

// 1. Planifier une soutenance (UC-PS-04 & UC-PS-06)
const createSoutenance = async (req, res) => {
    const { id_memoire, date_soutenance, heure_soutenance, salle, jury } = req.body;

    if (!id_memoire || !date_soutenance || !salle || !jury) {
        return res.status(400).json({ message: "Informations incomplètes" });
    }

    try {
        await db.query('START TRANSACTION');

        const [resultSoutenance] = await db.query(
            'INSERT INTO soutenances (id_memoire, date_soutenance, heure_soutenance, salle) VALUES (?, ?, ?, ?)',
            [id_memoire, date_soutenance, heure_soutenance, salle]
        );
        const idSoutenance = resultSoutenance.insertId;

        for (const member of jury) {
            await db.query(
                'INSERT INTO composition_jury (id_soutenance, id_enseignant, role_jury) VALUES (?, ?, ?)',
                [idSoutenance, member.id_enseignant, member.role]
            );
        }

        await db.query('COMMIT');
        res.status(201).json({ message: "Soutenance planifiée et jury constitué !" });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error("ERREUR createSoutenance :", error);
        res.status(500).json({ message: "Erreur serveur lors de la planification" });
    }
};

// 2. Lister les soutenances (AVEC FILTRE ARCHIVE)
const getAllSoutenances = async (req, res) => {
    const { archive } = req.query; 

    try {
        let query = `
            SELECT s.id_soutenance, s.date_soutenance, s.heure_soutenance, s.salle, s.est_archivee, s.statut_soutenance,
                   i.nom as nom_etudiant, i.prenom as prenom_etudiant,
                   t.titre as theme_titre
            FROM soutenances s
            JOIN memoires m ON s.id_memoire = m.id_memoire
            JOIN attributions a ON m.id_attribution = a.id_attribution
            JOIN impetrants i ON a.id_impetrant = i.id_impetrant
            JOIN themes t ON a.id_theme = t.id_theme
            WHERE 1=1
        `;

        if (archive === 'true') {
            query += ' AND s.est_archivee = TRUE';
        } else {
            query += ' AND s.est_archivee = FALSE';
        }
        
        query += ' ORDER BY s.date_soutenance DESC';

        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error("ERREUR getAllSoutenances :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 3. Données pour le formulaire (Listes pour le formulaire)
const getFormData = async (req, res) => {
    try {
        const [memoires] = await db.query(`
            SELECT m.id_memoire, t.titre 
            FROM memoires m
            JOIN attributions a ON m.id_attribution = a.id_attribution
            JOIN themes t ON a.id_theme = t.id_theme
            WHERE TRIM(m.statut_validation) = "Validé" 
            AND m.id_memoire NOT IN (SELECT id_memoire FROM soutenances)
        `);
        
        const [enseignants] = await db.query('SELECT id_enseignant, nom, prenom FROM enseignants WHERE statut_enseignant = "Actif"');

        res.json({ memoires, enseignants });
    } catch (error) {
        console.error("ERREUR SQL getFormData :", error);
        res.status(500).json({ message: "Erreur serveur récupération formulaire" });
    }
};

// 4. Modifier une soutenance
const updateSoutenance = async (req, res) => {
    const { id } = req.params;
    const { date_soutenance, heure_soutenance, salle, statut_soutenance } = req.body;

    try {
        let query = "UPDATE soutenances SET ";
        const params = [];
        const updates = [];

        if (date_soutenance) { updates.push("date_soutenance = ?"); params.push(date_soutenance); }
        if (heure_soutenance) { updates.push("heure_soutenance = ?"); params.push(heure_soutenance); }
        if (salle) { updates.push("salle = ?"); params.push(salle); }
        if (statut_soutenance) { updates.push("statut_soutenance = ?"); params.push(statut_soutenance); }

        if (updates.length === 0) {
            return res.status(400).json({ message: "Aucune modification à apporter" });
        }

        query += updates.join(", ") + " WHERE id_soutenance = ?";
        params.push(id);

        await db.query(query, params);
        res.json({ message: "Soutenance mise à jour !" });

    } catch (error) {
        console.error("ERREUR updateSoutenance :", error);
        res.status(500).json({ message: "Erreur serveur mise à jour" });
    }
};

// 5. Archiver une soutenance (Fin de Package 6)
const archiveSoutenance = async (req, res) => {
    const { id } = req.params;
    
    try {
        await db.query('UPDATE soutenances SET est_archivee = TRUE WHERE id_soutenance = ?', [id]);
        res.json({ message: "Soutenance archivée dans le système historique." });
    } catch (error) {
        console.error("ERREUR archiveSoutenance :", error);
        res.status(500).json({ message: "Erreur serveur archivage" });
    }
};

export { createSoutenance, getAllSoutenances, getFormData, updateSoutenance, archiveSoutenance };