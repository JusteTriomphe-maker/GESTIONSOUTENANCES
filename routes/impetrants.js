import express from 'express';
import { verifyToken } from '../middleware/securityMiddleware.js';
import { checkPermission } from '../middleware/authorizationMiddleware.js';
import { createImpetrant, getAllImpetrants, updateImpetrant, deleteImpetrant, desactivateImpetrant, activateImpetrant, searchImpetrants } from '../controllers/impetrantController.js';

const router = express.Router();

// CRUD Routes avec protection RBAC
// Tous les accès requièrent authentification + permission spécifique
// Seul le COORDONNATEUR a accès aux opérations impétrants

router.post('/add', verifyToken, checkPermission('UC-GImp-01'), createImpetrant);
router.get('/', verifyToken, checkPermission('UC-GImp-02'), getAllImpetrants);
router.get('/search', verifyToken, checkPermission('UC-GImp-02'), searchImpetrants);
router.put('/update/:id', verifyToken, checkPermission('UC-GImp-03'), updateImpetrant);
router.delete('/delete/:id', verifyToken, checkPermission('UC-GImp-04'), deleteImpetrant);
router.put('/desactivate/:id', verifyToken, checkPermission('UC-GImp-05'), desactivateImpetrant);
router.put('/activate/:id', verifyToken, checkPermission('UC-GImp-05'), activateImpetrant);

export default router;
