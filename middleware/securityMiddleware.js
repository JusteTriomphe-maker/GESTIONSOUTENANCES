import jwt from 'jsonwebtoken';
import { pool as db } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

// --- 1. VERIFICATION DU TOKEN (Gardien) ---
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: "Accès refusé. Pas de badge (token)." });
    }

    try {
        const bareToken = token.split(" ")[1];
        const decoded = jwt.verify(bareToken, process.env.JWT_SECRET || 'secret_key_very_secure');
        req.user = decoded; // On attache l'utilisateur à la requête
        next(); // On laisse passer
    } catch (err) {
        return res.status(401).json({ message: "Badge invalide ou périmé." });
    }
};

// --- 2. JOURNALISATION (Audit) ---
const auditLog = async (req, res, next) => {
    const date = new Date();
    // Note : Si c'est une route publique (login), req.user n'existe pas encore.
    const utilisateur = req.user?.email || 'Anonyme';
    
    try {
        // On ignore les options HEAD et GET pour ne pas polluer
        if (req.method !== 'GET') {
            await db.execute(
                'INSERT INTO logs (utilisateur, action, details) VALUES (?, ?, ?)',
                [utilisateur, req.method, `${req.url} par ${utilisateur}`]
            );
        }
    } catch (error) {
        // L'erreur de log ne doit pas planter l'app
        console.error("Erreur d'audit :", error);
    }
    
    next();
};

export { verifyToken, auditLog };