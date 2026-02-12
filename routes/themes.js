import express from 'express';
import { createTheme, getAllThemes, validateTheme } from '../controllers/themeController.js';

const router = express.Router();

router.post('/add', createTheme);
router.get('/', getAllThemes);
router.put('/validate/:id', validateTheme); // Pour valider

export default router;