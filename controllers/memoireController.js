import { pool as db } from '../config/db.js';

// 1. Déposer un mémoire (UC-PS-01)
const uploadMemoire = async (req, res) => {
    const { id_attribution } = req.body;
    const nomFichier = req.file.filename; // Le fichier vient de multer

    if (!id_attribution) {
        return res.status(400).json({ message: "Attribution requise" });
    }

    try {
        // Vérifier si l'attribution existe réellement
        const [check] = await db.query('SELECT * FROM attributions WHERE id_attribution = ?', [id_attribution]);
        if (check.length === 0) {
            return res.status(404).json({ message: "Attribution introuvable en base de données" });
        }

        const query = 'INSERT INTO memoires (id_attribution, nom_fichier) VALUES (?, ?)';
        await db.query(query, [id_attribution, nomFichier]);

        console.log(`INFO : Mémoire déposé pour attribution ID ${id_attribution}`);
        res.status(201).json({ message: "Mémoire déposé avec succès !" });
    } catch (error) {
        console.error("ERREUR uploadMemoire :", error);
        res.status(500).json({ message: "Erreur serveur lors du dépôt" });
    }
};

// 2. Lister tous les mémoires
const getAllMemoires = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT m.id_memoire, m.date_depot, m.statut_validation, m.nom_fichier,
                   i.nom as nom_etudiant, i.prenom as prenom_etudiant,
                   t.titre,
                   a.id_attribution
            FROM memoires m
            JOIN attributions a ON m.id_attribution = a.id_attribution
            JOIN impetrants i ON a.id_impetrant = i.id_impetrant
            JOIN themes t ON a.id_theme = t.id_theme
            ORDER BY m.date_depot DESC
        `);
        console.log(`INFO : Récupération de ${rows.length} mémoires pour l'affichage`);
        res.json(rows);
    } catch (error) {
        console.error("ERREUR getAllMemoires :", error);
        res.status(500).json({ message: "Erreur serveur récupération mémoires" });
    }
};

// 3. Valider un mémoire (UC-PS-02)
const validateMemoire = async (req, res) => {
    const { id } = req.params;
    
    try {
        const [result, meta] = await db.query(
            'UPDATE memoires SET statut_validation = "Validé" WHERE id_memoire = ?', 
            [id]
        );

        if (meta.affectedRows === 0) {
            console.warn(`WARNING : Aucune modification pour mémoire ID ${id}`);
            return res.status(404).json({ message: "Mémoire introuvable" });
        }

        console.log(`INFO : Mémoire ID ${id} validé`);
        res.json({ message: "Mémoire validé par le directeur" });
    } catch (error) {
        console.error("ERREUR validateMemoire :", error);
        res.status(500).json({ message: "Erreur serveur validation" });
    }
};

// 4. Rejeter un mémoire (UC-PS-03)
const rejectMemoire = async (req, res) => {
    const { id } = req.params;
    
    try {
        const [result, meta] = await db.query(
            'UPDATE memoires SET statut_validation = "Rejeté" WHERE id_memoire = ?', 
            [id]
        );

        if (meta.affectedRows === 0) {
            return res.status(404).json({ message: "Mémoire introuvable" });
        }

        console.log(`INFO : Mémoire ID ${id} rejeté`);
        res.json({ message: "Mémoire rejeté" });
    } catch (error) {
        console.error("ERREUR rejectMemoire :", error);
        res.status(500).json({ message: "Erreur serveur rejet" });
    }
};

// 5. Supprimer un mémoire
const deleteMemoire = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM memoires WHERE id_memoire = ?', [id]);
        console.log(`INFO : Mémoire ID ${id} supprimé`);
        res.json({ message: "Mémoire supprimé. Vous pouvez le redéposer." });
    } catch (error) {
        console.error("ERREUR deleteMemoire :", error);
        res.status(500).json({ message: "Erreur serveur suppression" });
    }
};

export { uploadMemoire, getAllMemoires, validateMemoire, rejectMemoire, deleteMemoire };