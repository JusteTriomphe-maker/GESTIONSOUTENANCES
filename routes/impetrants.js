import express from 'express';
import { createImpetrant, getAllImpetrants, updateImpetrant, deleteImpetrant, desactivateImpetrant, activateImpetrant, searchImpetrants } from '../controllers/impetrantController.js';

const router = express.Router();

// CRUD Routes
router.post('/add', createImpetrant);                    // POST /api/impetrants/add
router.get('/', getAllImpetrants);                       // GET /api/impetrants
router.get('/search', searchImpetrants);                 // GET /api/impetrants/search
router.put('/update/:id', updateImpetrant);              // PUT /api/impetrants/update/:id
router.delete('/delete/:id', deleteImpetrant);           // DELETE /api/impetrants/delete/:id
router.put('/desactivate/:id', desactivateImpetrant);    // PUT /api/impetrants/desactivate/:id
router.put('/activate/:id', activateImpetrant);          // PUT /api/impetrants/activate/:id

export default router;
