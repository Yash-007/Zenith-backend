import {Router} from 'express';
import { createUserRewardEntry, getUserRewardByRewardId, getUserRewardsHistory } from '../controllers/rewardHistory';
import { authenticateToken } from '../middlewares/auth';

const rewardRouter = Router();

rewardRouter.use(authenticateToken);

rewardRouter.post("/entry", createUserRewardEntry)
rewardRouter.get("/history", getUserRewardsHistory)
rewardRouter.get("/:rewardId", getUserRewardByRewardId)

export default rewardRouter;