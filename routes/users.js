import express from 'express';
import { verifyToken } from '../middleware/securityMiddleware.js';
import { checkPermission, checkRole } from '../middleware/authorizationMiddleware.js';
import { getAllUsers, createUser, updateUserProfile, changePassword } from '../controllers/userController.js';

const router = express.Router();

// Lister tous les utilisateurs : ADMIN seulement
router.get('/', verifyToken, checkRole(['ADMIN']), getAllUsers);

// Créer un utilisateur : ADMIN seulement (UC-GCU-01)
router.post('/add', verifyToken, checkPermission('UC-GCU-01'), createUser);

// Mettre à jour son propre profil : authentifié (UC-GCU-03)
router.put('/:id', verifyToken, checkPermission('UC-GCU-03'), updateUserProfile);

// Changer son mot de passe : authentifié (UC-GCU-04)
router.put('/:id/password', verifyToken, checkPermission('UC-GCU-04'), changePassword);

export default router;