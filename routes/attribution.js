import express from 'express';
import { verifyToken } from '../middleware/securityMiddleware.js';
import { checkPermission } from '../middleware/authorizationMiddleware.js';
import { createAttribution, getAllAttributions, getFormData } from '../controllers/attributionController.js';

const router = express.Router();

// COORDONNATEUR seulement pour les attributions directeur
router.post('/add', verifyToken, checkPermission('UC-ADM-01'), createAttribution);
router.get('/', verifyToken, checkPermission('UC-ADM-01'), getAllAttributions);
router.get('/form-data', verifyToken, checkPermission('UC-ADM-01'), getFormData);

export default router;