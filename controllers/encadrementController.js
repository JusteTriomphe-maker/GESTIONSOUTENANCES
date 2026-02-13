import { pool as db } from '../config/db.js';

// Récupérer les étudiants encadrés par l'enseignant connecté
const getEncadrementsByTeacher = async (req, res) => {
    // Supposons que l'ID de l'enseignant soit passé en paramètre ou via le token (middleware auth)
    // Ici on le prend dans les params pour simplifier comme dans tes autres exemples
    const { id_enseignant } = req.params; 

    try {
        const query = `
            SELECT a.id_attribution, a.statut_depot, 
                   i.nom as nom_etudiant, i.prenom as prenom_etudiant,
                   t.titre as theme_titre
            FROM attributions a
            JOIN impetrants i ON a.id_impetrant = i.id_impetrant
            JOIN themes t ON a.id_theme = t.id_theme
            WHERE a.id_enseignant = ?
            ORDER BY a.date_attribution DESC
        `;
        const [rows] = await db.query(query, [id_enseignant]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Valider ou Rejeter un dépôt
const updateDepotStatus = async (req, res) => {
    const { id } = req.params;
    const { statut } = req.body; // 'Validé' ou 'Rejeté'

    if (!['Validé', 'Rejeté'].includes(statut)) {
        return res.status(400).json({ message: "Statut invalide" });
    }

    try {
        await db.query('UPDATE attributions SET statut_depot = ? WHERE id_attribution = ?', [statut, id]);
        res.json({ message: `Dépôt ${statut.toLowerCase()}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur mise à jour statut" });
    }
};

export { getEncadrementsByTeacher, updateDepotStatus };