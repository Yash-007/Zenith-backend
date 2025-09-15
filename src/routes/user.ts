import {Router} from 'express';
import { CreateUserController } from '../controllers/user';

const userRouter = Router();


userRouter.post("/", CreateUserController);

export default userRouter;