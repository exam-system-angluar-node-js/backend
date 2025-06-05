import { Router } from 'express';
import { uploadImage } from '../handlers/uploadHandler';
import { upload } from '../utils/fileUpload';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Upload image route - protected by authentication
router.post('/image', authenticateToken, upload.single('image'), uploadImage);

export default router; 