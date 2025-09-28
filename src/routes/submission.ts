import { Router } from "express";
import {getAllUserSubmissions, getLastTenUserSubmissions, getSubmissionBySubmissionId, getUserSubmissionByChallengeId, submitChallengeController, updateSubmissionStatusController } from "../controllers/submission";
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
submissionRouter.patch("/:submissionId", updateSubmissionStatusController);

export default submissionRouter;
