import {Router} from 'express';
import { CreateUserController, LoginUserController } from '../controllers/user';
import { authenticateToken } from '../middlewares/auth';

const userRouter = Router();


// userRouter.use(authenticateToken)
userRouter.post("/register", CreateUserController);
userRouter.post("/login", LoginUserController)

export default userRouter;