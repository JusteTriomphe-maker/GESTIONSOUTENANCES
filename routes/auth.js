import express from 'express';
import { login, registerUser } from '../controllers/authController.js';
import { verifyToken } from '../middleware/securityMiddleware.js'; // <--- UNIQUE IMPORT


const router = express.Router();

// Routes publiques (Pas besoin de Token)
router.post('/login', login);
router.post('/register', registerUser);

export default router;