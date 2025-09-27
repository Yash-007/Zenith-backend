import { Router } from "express";
import { authenticateToken } from "../middlewares/auth";
import { answerUserQuery, getUserChats } from "../controllers/chat";

const chatRouter = Router();

chatRouter.use(authenticateToken);
chatRouter.post('/query', answerUserQuery);
chatRouter.get('/all', getUserChats);

export default chatRouter;