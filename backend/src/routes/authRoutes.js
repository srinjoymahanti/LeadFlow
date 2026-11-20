import { Router } from 'express';
import { signup, login, me } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { signupRules, loginRules } from '../utils/validators.js';
const router = Router();
router.post('/signup', signupRules, signup);
router.post('/login', loginRules, login);
router.get('/me', protect, me);
export default router;
