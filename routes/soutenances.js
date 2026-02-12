import express from 'express';
import { createSoutenance, getAllSoutenances, getFormData, updateSoutenance, archiveSoutenance } from '../controllers/soutenanceController.js';

const router = express.Router();

router.post('/add', createSoutenance);
router.get('/', getAllSoutenances);
router.get('/form-data', getFormData);
router.put('/:id', updateSoutenance);
router.post('/archive/:id', archiveSoutenance); 

export default router;