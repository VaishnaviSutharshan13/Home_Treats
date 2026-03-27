import { Router } from 'express';
import { adminOnly, authMiddleware } from '../middleware/auth';
import { uploadHeroImage } from '../middleware/upload';
import { getHeroImage, updateHeroImage } from '../controllers/settingsController';

const router = Router();

router.get('/hero-image', getHeroImage);
router.post('/hero-image', authMiddleware, adminOnly, uploadHeroImage.single('heroImage'), updateHeroImage);

export default router;
