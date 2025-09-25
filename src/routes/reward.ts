import {Router} from 'express';
import { createUserRewardEntry, getUserRewardsHistory } from '../controllers/rewardHistory';
import { authenticateToken } from '../middlewares/auth';

const rewardRouter = Router();

rewardRouter.use(authenticateToken);

rewardRouter.post("/entry", createUserRewardEntry)
rewardRouter.get("/history", getUserRewardsHistory)

export default rewardRouter;