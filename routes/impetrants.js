import express from 'express';
import { createImpetrant, getAllImpetrants } from '../controllers/impetrantController.js';

const router = express.Router();

router.post('/add', createImpetrant);        // POST /api/impetrants/add
router.get('/', getAllImpetrants);           // GET /api/impetrants

export default router;