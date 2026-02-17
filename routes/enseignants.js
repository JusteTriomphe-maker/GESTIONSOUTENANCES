import express from 'express';
import { verifyToken } from '../middleware/securityMiddleware.js';
import { checkPermission } from '../middleware/authorizationMiddleware.js';
import { createEnseignant, getAllEnseignants, updateEnseignant, deleteEnseignant, desactivateEnseignant, activateEnseignant, searchEnseignants } from '../controllers/enseignantController.js';

const router = express.Router();

// CRUD Routes avec sécurité RBAC (COORDONNATEUR seulement)
router.post('/add', verifyToken, checkPermission('UC-GEns-01'), createEnseignant);
router.get('/', verifyToken, checkPermission('UC-GEns-02'), getAllEnseignants);
router.get('/search', verifyToken, checkPermission('UC-GEns-02'), searchEnseignants);
router.put('/update/:id', verifyToken, checkPermission('UC-GEns-03'), updateEnseignant);
router.delete('/delete/:id', verifyToken, checkPermission('UC-GEns-04'), deleteEnseignant);
router.put('/desactivate/:id', verifyToken, checkPermission('UC-GEns-05'), desactivateEnseignant);
router.put('/activate/:id', verifyToken, checkPermission('UC-GEns-05'), activateEnseignant);

export default router;
