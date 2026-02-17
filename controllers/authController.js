import { pool as db } from '../config/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// 1. Inscription (Hachage)
// Dans authController.js

const registerUser = async (req, res) => {
    const { nom, prenom, email, password, role } = req.body;

    if (!nom || !prenom || !email || !password || !role) {
        return res.status(400).json({ message: "Données incomplètes" });
    }

    try {
        // Vérifier si l'email existe déjà
        const [existing] = await db.query('SELECT id FROM utilisateurs WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: "Cet email existe déjà" });
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // --- ÉTAPE CLÉ : CONVERTIR LE NOM DU RÔLE EN ID ---
        let roleId = role;

        // Si ce qu'on reçoit n'est pas un nombre (ex: "IMPETRANT" ou "ADMIN"), on cherche l'ID correspondant
        if (isNaN(role)) {
            console.log(`>>> Recherche de l'ID pour le rôle : ${role}`);
            
            // On cherche dans la table 'roles' si le code ou le nom correspond
            const [roleRows] = await db.query(
                'SELECT id_role FROM roles WHERE code_role = ? OR nom_role = ?', 
                [role, role]
            );

            if (roleRows.length === 0) {
                return res.status(400).json({ message: `Le rôle "${role}" n'existe pas dans la base de données.` });
            }

            roleId = roleRows[0].id_role;
            console.log(`>>> Rôle trouvé : ID = ${roleId}`);
        }
        // ----------------------------------------------------

        // Insérer avec le bon ID numérique
        const query = `
            INSERT INTO utilisateurs 
            (nom, prenom, email, password, id_role, date_creation, est_actif) 
            VALUES (?, ?, ?, ?, ?, NOW(), 1)
        `;
        
        await db.query(query, [nom, prenom, email, hashedPassword, roleId]);

        console.log(">>> COMPTE CRÉÉ AVEC SUCCÈS");
        res.status(201).json({ message: "Utilisateur créé avec succès !" });

    } catch (error) {
        console.error(">>> ERREUR INSCRIPTION :", error);
        res.status(500).json({ message: "Erreur lors de l'inscription." });
    }
};

// 2. Connexion avec récupération rôle et permissions
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    try {
        // Récupérer l'utilisateur avec son rôle
        const query = `
            SELECT u.id, u.nom, u.prenom, u.email, u.password, u.id_role, 
                   r.code_role, r.nom_role, u.est_actif
            FROM utilisateurs u
            JOIN roles r ON u.id_role = r.id_role
            WHERE u.email = ? AND u.est_actif = TRUE
        `;
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

        // Récupérer les permissions du rôle
        const [permissions] = await db.query(`
            SELECT p.code_permission, p.nom_permission, p.package_id
            FROM role_permissions rp
            JOIN permissions p ON rp.id_permission = p.id_permission
            WHERE rp.id_role = ? AND rp.est_autorise = TRUE
            ORDER BY p.package_id, p.code_permission
        `, [user.id_role]);

        // Génération Token JWT
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                codeRole: user.code_role, 
                nomRole: user.nom_role,
                nom: user.nom,
                idRole: user.id_role
            },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '24h' }
        );

        console.log(">>> CONNEXION RÉUSSIE POUR :", email, `(${user.code_role})`);

        res.json({
            message: "Connexion réussie !",
            token: token,
            user: { 
                id: user.id, 
                nom: user.nom, 
                prenom: user.prenom, 
                email: user.email, 
                idRole: user.id_role,
                codeRole: user.code_role,
                nomRole: user.nom_role
            },
            permissions: permissions.map(p => ({
                code: p.code_permission,
                nom: p.nom_permission,
                package: p.package_id
            }))
        });

    } catch (error) {
        console.error(">>> ERREUR LOGIN :", error);
        
        // Gestion spécifique des erreurs de connexion
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                message: "Base de données indisponible. Vérifiez que MySQL est en cours d'exécution.",
                error: error.code 
            });
        }
        
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 3. Obtenir le profil de l'utilisateur connecté avec rôle et permissions (UC-GCU-03)
const getProfile = async (req, res) => {
    const userId = req.user.id;

    try {
        // Récupérer l'utilisateur avec son rôle
        const [userRows] = await db.query(
            `SELECT u.id, u.nom, u.prenom, u.email, u.date_creation, 
                    r.id_role, r.code_role, r.nom_role
             FROM utilisateurs u
             JOIN roles r ON u.id_role = r.id_role
             WHERE u.id = ? AND u.est_actif = TRUE`,
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé ou inactif" });
        }

        const user = userRows[0];

        // Récupérer les permissions du rôle
        const [permissions] = await db.query(`
            SELECT p.code_permission, p.nom_permission, p.package_id
            FROM role_permissions rp
            JOIN permissions p ON rp.id_permission = p.id_permission
            WHERE rp.id_role = ? AND rp.est_autorise = TRUE
            ORDER BY p.package_id, p.code_permission
        `, [user.id_role]);

        res.json({
            id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            date_creation: user.date_creation,
            role: {
                id: user.id_role,
                code: user.code_role,
                nom: user.nom_role
            },
            permissions: permissions.map(p => ({
                code: p.code_permission,
                nom: p.nom_permission,
                package: p.package_id
            }))
        });
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
