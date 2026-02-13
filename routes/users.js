import express from 'express';
import { getAllUsers, createUser, updateUserProfile, changePassword } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getAllUsers);
router.post('/add', createUser);
router.put('/:id', updateUserProfile);
router.put('/:id/password', changePassword);

export default router;