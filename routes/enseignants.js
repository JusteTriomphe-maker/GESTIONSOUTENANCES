import express from 'express';
import { createEnseignant, getAllEnseignants } from '../controllers/enseignantController.js';

const router = express.Router();

router.post('/add', createEnseignant);
router.get('/', getAllEnseignants);

export default router;