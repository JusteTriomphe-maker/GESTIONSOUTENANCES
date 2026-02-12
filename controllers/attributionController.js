import { pool as db } from '../config/db.js';

// 1. Attribuer un directeur (UC-ADM-01)
const createAttribution = async (req, res) => {
    const { id_impetrant, id_enseignant, id_theme } = req.body;

    if (!id_impetrant || !id_enseignant || !id_theme) {
        return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    try {
        // Vérifier la capacité du prof (RM-04)
        const [checkCapacity] = await db.query(`
            SELECT capacite_encadrement, COUNT(attributions.id_attribution) as current_load
            FROM enseignants
            LEFT JOIN attributions ON enseignants.id_enseignant = attributions.id_enseignant
            WHERE enseignants.id_enseignant = ?
            GROUP BY enseignants.id_enseignant
        `, [id_enseignant]);

        if (checkCapacity.length > 0) {
            const { capacite_encadrement, current_load } = checkCapacity[0];
            if (current_load >= capacite_encadrement) {
                return res.status(409).json({ message: `Ce professeur a atteint sa capacité (${capacite_encadrement} étudiants).` });
            }
        }

        // Vérifier si l'étudiant a déjà un directeur
        const [checkStudent] = await db.query('SELECT * FROM attributions WHERE id_impetrant = ?', [id_impetrant]);
        if (checkStudent.length > 0) {
            return res.status(409).json({ message: "Cet impétrant a déjà un directeur de mémoire attribué." });
        }

        // Insérer
        const query = 'INSERT INTO attributions (id_impetrant, id_enseignant, id_theme) VALUES (?, ?, ?)';
        await db.query(query, [id_impetrant, id_enseignant, id_theme]);

        res.status(201).json({ message: "Attribution enregistrée avec succès !" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 2. Lister les attributions (avec infos lisibles)
const getAllAttributions = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT a.id_attribution, a.date_attribution,
                   i.nom as nom_etudiant, i.prenom as prenom_etudiant,
                   e.nom as nom_ens, e.prenom as prenom_ens,
                   t.titre as theme_titre, t.statut_theme
            FROM attributions a
            JOIN impetrants i ON a.id_impetrant = i.id_impetrant
            JOIN enseignants e ON a.id_enseignant = e.id_enseignant
            JOIN themes t ON a.id_theme = t.id_theme
            ORDER BY a.date_attribution DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 3. Récupérer les données pour les menus déroulants (Listes pour le formulaire)
const getFormData = async (req, res) => {
    try {
        const [impetrants] = await db.query('SELECT id_impetrant, nom, prenom FROM impetrants WHERE statut_impetrant = "Actif"');
        const [enseignants] = await db.query('SELECT id_enseignant, nom, prenom FROM enseignants WHERE statut_enseignant = "Actif"');
        const [themes] = await db.query('SELECT id_theme, titre FROM themes WHERE statut_theme = "Validé"');
        
        res.json({ impetrants, enseignants, themes });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export { createAttribution, getAllAttributions, getFormData };