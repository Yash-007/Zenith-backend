import {Router} from 'express';
import { authenticateToken } from '../middlewares/auth';
import { createChallengeController, getAllChallenges, getChallengById } from '../controllers/challenge';

const challengeRouter = Router();

challengeRouter.use(authenticateToken);

challengeRouter.post("", createChallengeController)
challengeRouter.get("", getChallengById)
challengeRouter.get("/all", getAllChallenges)

export default challengeRouter;