import {Router} from 'express';
import { CreateUserController, GetUserController, LoginUserController } from '../controllers/user';
import { authenticateToken } from '../middlewares/auth';

const userRouter = Router();


userRouter.post("/register", CreateUserController);
userRouter.post("/login", LoginUserController)

userRouter.get("", authenticateToken, GetUserController)

export default userRouter;