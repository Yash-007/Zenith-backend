import {Router} from 'express';
import { CreateUserController, LoginUserController } from '../controllers/user';

const userRouter = Router();


userRouter.post("/register", CreateUserController);
userRouter.post("/login", LoginUserController)

export default userRouter;