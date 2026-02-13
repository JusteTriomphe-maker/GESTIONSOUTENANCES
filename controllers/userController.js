import { pool as db } from '../config/db.js';
import bcrypt from 'bcryptjs';

// 1. Récupérer tous les utilisateurs
const getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM utilisateurs');
        res.json(rows);
    } catch (error) {
        console.error("❌ ERREUR SQL (Get Users):", error.message); // Regarde ton terminal Node.js ici !
        res.status(500).json({ message: "Erreur serveur", details: error.message });
    }
};

// 2. Créer un utilisateur
const createUser = async (req, res) => {
    const { nom, email, password, role } = req.body;
    if (!nom || !email || !password) return res.status(400).json({ message: "Champs manquants" });

    try {
        // Hacher le mot de passe (10 rounds de sécurité)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const query = 'INSERT INTO utilisateurs (nom, email, password, role) VALUES (?, ?, ?, ?)';
        await db.query(query, [nom, email, hashedPassword, role]);
        res.status(201).json({ message: "Utilisateur créé" });
    } catch (error) {
        console.error("❌ ERREUR SQL (Create User):", error.message);
        res.status(500).json({ message: "Erreur création", details: error.message });
    }
};

// 3. Mettre à jour profil (C'est ici que ça plantait pour le mdp et le profil)
const updateUserProfile = async (req, res) => {
    const { id } = req.params;
    const { nom, email } = req.body;

    try {
        // J'AI CHANGE ICI : 'WHERE id' au lieu de 'WHERE id_utilisateur'
        const query = 'UPDATE utilisateurs SET nom = ?, email = ? WHERE id = ?';
        await db.query(query, [nom, email, id]);
        res.json({ message: "Profil mis à jour" });
    } catch (error) {
        console.error("❌ ERREUR SQL (Update Profile):", error.message);
        res.status(500).json({ message: "Erreur mise à jour", details: error.message });
    }
};

// 4. Changer mot de passe
const changePassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body; 

    try {
        // Hacher le nouveau mot de passe (10 rounds de sécurité)
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // J'AI CHANGE ICI : 'WHERE id'
        const query = 'UPDATE utilisateurs SET password = ? WHERE id = ?';
        await db.query(query, [hashedPassword, id]);
        res.json({ message: "Mot de passe changé" });
    } catch (error) {
        console.error("❌ ERREUR SQL (Change Pwd):", error.message);
        res.status(500).json({ message: "Erreur mdp", details: error.message });
    }
};

export { getAllUsers, createUser, updateUserProfile, changePassword };