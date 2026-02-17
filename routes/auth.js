import express from 'express';
import { login, registerUser, getProfile, updateProfile, changePassword, forgotPassword } from '../controllers/authController.js';
import { verifyToken } from '../middleware/securityMiddleware.js';


const router = express.Router();

// Routes publiques (Pas besoin de Token)
router.post('/login', login);
router.post('/register', registerUser);
router.post('/forgot-password', forgotPassword);

// Routes protégées (Nécessitent un token)
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);

export default router;
