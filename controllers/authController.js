import { pool as db } from '../config/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// 1. Inscription (Hachage)
const registerUser = async (req, res) => {
    const { nom, prenom, email, password, role } = req.body;

    // On attend exactement 5 champs : nom, prenom, email, password, role
    if (!nom || !prenom || !email || !password || !role) {
        return res.status(400).json({ message: "Données incomplètes" });
    }

    try {
        // Vérifier si l'email existe déjà
        const [existing] = await db.query('SELECT id FROM utilisateurs WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: "Cet email existe déjà" });
        }

        // Hacher le mot de passe (10 rounds de sécurité)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insérer (Ordre : nom, prenom, email, password, role)
        const query = 'INSERT INTO utilisateurs (nom, prenom, email, password, role) VALUES (?, ?, ?, ?, ?)';
        await db.query(query, [nom, prenom, email, hashedPassword, role]);

        console.log(">>> COMPTE CRÉÉ AVEC SUCCÈS");
        res.status(201).json({ message: "Utilisateur créé avec succès !" });

    } catch (error) {
        console.error(">>> ERREUR INSCRIPTION :", error);
        res.status(500).json({ message: "Erreur lors de l'inscription." });
    }
};

// 2. Connexion
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    try {
        const query = 'SELECT * FROM utilisateurs WHERE email = ?';
        const [rows] = await db.query(query, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        const user = rows[0];

        // Comparaison Hachée
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        // Génération Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, nom: user.nom },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '24h' }
        );

        console.log(">>> CONNEXION RÉUSSIE POUR :", email);

        res.json({
            message: "Connexion réussie !",
            token: token,
            user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error(">>> ERREUR LOGIN :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 3. Obtenir le profil de l'utilisateur connecté (UC-GCU-03)
const getProfile = async (req, res) => {
    const userId = req.user.id;

    try {
        const [rows] = await db.query(
            'SELECT id, nom, prenom, email, role, date_creation FROM utilisateurs WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("ERREUR getProfile :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 4. Modifier le profil (UC-GCU-03)
const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { nom, prenom, email } = req.body;

    try {
        if (email) {
            const [existing] = await db.query('SELECT id FROM utilisateurs WHERE email = ? AND id != ?', [email, userId]);
            if (existing.length > 0) {
                return res.status(409).json({ message: "Cet email est déjà utilisé" });
            }
        }

        const updates = [];
        const params = [];

        if (nom) { updates.push("nom = ?"); params.push(nom); }
        if (prenom) { updates.push("prenom = ?"); params.push(prenom); }
        if (email) { updates.push("email = ?"); params.push(email); }

        if (updates.length === 0) {
            return res.status(400).json({ message: "Aucune modification à apporter" });
        }

        params.push(userId);
        const query = `UPDATE utilisateurs SET ${updates.join(", ")} WHERE id = ?`;
        
        await db.query(query, params);
        res.json({ message: "Profil mis à jour avec succès" });
    } catch (error) {
        console.error("ERREUR updateProfile :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 5. Changer le mot de passe (UC-GCU-04)
const changePassword = async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Mot de passe actuel et nouveau mot de passe requis" });
    }

    try {
        const [rows] = await db.query('SELECT password FROM utilisateurs WHERE id = ?', [userId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
        if (!isMatch) {
            return res.status(401).json({ message: "Mot de passe actuel incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await db.query('UPDATE utilisateurs SET password = ? WHERE id = ?', [hashedPassword, userId]);
        res.json({ message: "Mot de passe modifié avec succès" });
    } catch (error) {
        console.error("ERREUR changePassword :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 6. Récupérer le mot de passe (UC-GCU-04)
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email requis" });
    }

    try {
        const [rows] = await db.query('SELECT id FROM utilisateurs WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.json({ message: "Si cet email existe, un lien de récupération sera envoyé" });
        }

        console.log(`>>> DEMANDE RÉCUPÉRATION MOT DE PASSE POUR: ${email}`);
        
        res.json({ message: "Si cet email existe, un lien de récupération sera envoyé" });
    } catch (error) {
        console.error("ERREUR forgotPassword :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export { registerUser, login, getProfile, updateProfile, changePassword, forgotPassword };
