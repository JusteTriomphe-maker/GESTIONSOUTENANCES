import express from 'express';
import { createAttribution, getAllAttributions, getFormData } from '../controllers/attributionController.js';

const router = express.Router();

router.post('/add', createAttribution);
router.get('/', getAllAttributions);
router.get('/form-data', getFormData); // Pour les dropdowns

export default router;