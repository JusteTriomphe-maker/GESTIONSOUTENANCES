import express from 'express';
import { getEncadrementsByTeacher, updateDepotStatus } from '../controllers/encadrementController.js';

const router = express.Router();

router.get('/enseignant/:id_enseignant', getEncadrementsByTeacher);
router.put('/depot/:id', updateDepotStatus);

export default router;