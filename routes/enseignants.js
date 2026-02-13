import express from 'express';
import { createEnseignant, getAllEnseignants, updateEnseignant, deleteEnseignant, desactivateEnseignant, activateEnseignant, searchEnseignants } from '../controllers/enseignantController.js';

const router = express.Router();

// CRUD Routes
router.post('/add', createEnseignant);
router.get('/', getAllEnseignants);
router.get('/search', searchEnseignants);
router.put('/update/:id', updateEnseignant);
router.delete('/delete/:id', deleteEnseignant);
router.put('/desactivate/:id', desactivateEnseignant);
router.put('/activate/:id', activateEnseignant);

export default router;
