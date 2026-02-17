import express from 'express';
import { verifyToken } from '../middleware/securityMiddleware.js';
import { checkPermission } from '../middleware/authorizationMiddleware.js';
import { uploadMemoire, getAllMemoires, validateMemoire, rejectMemoire } from '../controllers/memoireController.js';
import upload from '../config/multerConfig.js';

const router = express.Router();

// Déposer un mémoire : IMPÉTRANT (UC-PS-01)
router.post('/add', verifyToken, checkPermission('UC-PS-01'), upload.single('fichier'), uploadMemoire);

// Lister tous les mémoires (authentifiés seulement)
router.get('/', verifyToken, getAllMemoires);

// Valider un mémoire : ENSEIGNANT (directeur) ou COORDONNATEUR (UC-PS-02)
router.put('/validate/:id', verifyToken, checkPermission('UC-PS-02'), validateMemoire);

// Rejeter un mémoire : ENSEIGNANT (directeur) ou COORDONNATEUR (UC-PS-03)
router.put('/reject/:id', verifyToken, checkPermission('UC-PS-03'), rejectMemoire);

export default router;
