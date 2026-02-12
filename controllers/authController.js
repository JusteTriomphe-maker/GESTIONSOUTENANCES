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

export { registerUser, login };