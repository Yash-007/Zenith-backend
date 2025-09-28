import {Router} from 'express';
import { CreateUserController, getLeaderboardController, GetUserController, LoginUserController } from '../controllers/user';
import { authenticateToken } from '../middlewares/auth';

const userRouter = Router();


userRouter.post("/register", CreateUserController);
userRouter.post("/login", LoginUserController)

userRouter.use(authenticateToken);
userRouter.get("", GetUserController);
userRouter.get("/leaderboard", getLeaderboardController);

export default userRouter;