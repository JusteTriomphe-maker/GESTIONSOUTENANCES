import express from 'express';
import { uploadMemoire, getAllMemoires, validateMemoire, rejectMemoire } from '../controllers/memoireController.js';
import upload from '../config/multerConfig.js';

const router = express.Router();

// Déposer un mémoire (avec fichier)
router.post('/add', upload.single('fichier'), uploadMemoire);

// Lister tous les mémoires
router.get('/', getAllMemoires);

// ✅ Nouvelles routes pour changer le statut
router.put('/validate/:id', validateMemoire);
router.put('/reject/:id', rejectMemoire);

export default router;
