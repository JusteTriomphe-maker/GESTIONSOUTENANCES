import express from 'express';
import { verifyToken } from '../middleware/securityMiddleware.js';
import { checkPermission, checkAnyPermission } from '../middleware/authorizationMiddleware.js';
import { createTheme, getAllThemes, validateTheme } from '../controllers/themeController.js';

const router = express.Router();

// Proposer un thème : ENSEIGNANT, IMPÉTRANT, PARTENAIRE
router.post('/add', verifyToken, checkAnyPermission(['UC-GTh-01']), createTheme);

// Lister tous les thèmes
router.get('/', verifyToken, getAllThemes);

// Valider un thème : COMMISSION_VALIDATION, COORDONNATEUR
router.put('/validate/:id', verifyToken, checkAnyPermission(['UC-GTh-02']), validateTheme);

export default router;