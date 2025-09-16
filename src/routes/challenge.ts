import {Router} from 'express';
import { authenticateToken } from '../middlewares/auth';
import { createChallengeController } from '../controllers/challenge';

const challengRouter = Router();

challengRouter.use(authenticateToken);

challengRouter.post("", createChallengeController)

export default challengRouter;