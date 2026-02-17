import express from 'express';
import { verifyToken } from '../middleware/securityMiddleware.js';
import { checkPermission, checkAnyPermission } from '../middleware/authorizationMiddleware.js';
import { createSoutenance, getAllSoutenances, getFormData, updateSoutenance, archiveSoutenance } from '../controllers/soutenanceController.js';

const router = express.Router();

// Créer/Programmer une soutenance : COORDONNATEUR (UC-PS-06)
router.post('/add', verifyToken, checkPermission('UC-PS-06'), createSoutenance);

// Lister les soutenances (tous les utilisateurs connectés peuvent voir)
router.get('/', verifyToken, getAllSoutenances);

// Données pour le formulaire : COORDONNATEUR
router.get('/form-data', verifyToken, checkPermission('UC-PS-06'), getFormData);

// Modifier une soutenance : COORDONNATEUR
router.put('/:id', verifyToken, checkPermission('UC-PS-05'), updateSoutenance);

// Archiver une soutenance : COORDONNATEUR
router.post('/archive/:id', verifyToken, checkPermission('UC-PS-07'), archiveSoutenance);

export default router;