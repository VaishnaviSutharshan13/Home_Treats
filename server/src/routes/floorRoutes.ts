import { Router } from 'express';
import { getFloorDetails } from '../controllers/floorController';

const router = Router();

router.get('/:floorId', getFloorDetails);

export default router;
