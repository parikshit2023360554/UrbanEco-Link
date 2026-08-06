import express from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public Authentication Routes
router.post('/register', register);
router.post('/signup', register);
router.post('/login', login);

// Protected User Routes
router.get('/me', protect, getProfile);

export default router;
