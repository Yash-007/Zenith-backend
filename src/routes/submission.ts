import { Router } from "express";
import {getAllUserSubmissions, getLastTenUserSubmissions, getSubmissionBySubmissionId, getUserSubmissionByChallengeId, submitChallengeController } from "../controllers/submission";
import { authenticateToken } from "../middlewares/auth";
import { upload } from "../middlewares/multer";

const submissionRouter = Router();

submissionRouter.use(authenticateToken)

submissionRouter.post('/submit', upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 2 }
]), submitChallengeController);

submissionRouter.get("/challenge", getUserSubmissionByChallengeId)

submissionRouter.get("/recent", getLastTenUserSubmissions)
submissionRouter.get("/all", getAllUserSubmissions);
submissionRouter.get("/", getSubmissionBySubmissionId);

export default submissionRouter;
