import { Router } from "express";
import { submitChallengeController } from "../controllers/submission";
import { authenticateToken } from "../middlewares/auth";
import { upload } from "../middlewares/multer";

const submissionRouter = Router();

submissionRouter.use(authenticateToken)
submissionRouter.post('/submit', upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 2 }
]), submitChallengeController);

export default submissionRouter;