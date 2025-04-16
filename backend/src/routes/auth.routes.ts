import { Router } from 'express';
import { register } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema } from '../validators/auth.validator';

const router: Router = Router();

// Register a new user
router.post('/register', validate(registerSchema), register);

export default router;
