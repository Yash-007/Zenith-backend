import { SubmissionWithChallenge, submitSubmissionRequest, submitSubmissionSchema, updateSubmissionStatusRequest, updateSubmissionStatusSchema } from "../types/submission.types";
import { ErrorResponse, SuccessResponse } from "../types/common.types";
import { createSubmission, fetchAllSubmissions, fetchLastTenSubmissionsByUserId, fetchSubmissionByChallengeIdAndUserId, fetchSubmissionBySubmissionId, updateSubmissionStatus } from "../repo/submission";
import { Request, Response } from "express";
import { getUserById, updateUserWithSpecificFields } from "../repo/user";
import { getChallengeById } from "../repo/challenge";
import { User } from "@prisma/client";

export const submitChallengeController= async (req: Request<{}, {}, submitSubmissionRequest> & {userId?: string}, res: Response<SuccessResponse | ErrorResponse>) => {
    try {
        const userId = req.userId as string;

        const result = submitSubmissionSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ 
                success: false,
                message: result.error.issues[0]?.message || 'Invalid request body'
            } as ErrorResponse);
        }

        const validatedData = result.data;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

        const images = files?.images?.map(file => file.path) || [];
        const videos = files?.videos?.map(file => file.path) || [];

        const submission = {
            ...validatedData,
            userId,
            proofs: {
                text: validatedData.text || '',
                images,
                videos
            }
        };
        delete submission.text
       const createdSubmission = await createSubmission(submission);
       if (!createdSubmission){
        return res.status(500).json({ 
            success: false,
            message: "Failed to submit challenge",
        } as ErrorResponse);
       }

       const user = await getUserById(userId);

       const userFields = {
        currentStreak: user.currentStreak+1,
        longestStreak: Math.max(user.longestStreak, user.currentStreak+1),
        challengesSubmitted: user.challengesSubmitted+1,
        challengesInReview: user.challengesInReview+1,
       }

       const updatedUser = await updateUserWithSpecificFields(userId, userFields);

       if (!updatedUser) {
        return res.status(500).json({
            success: false,
            message: "Failed to update user"
        } as ErrorResponse);
       }

        return res.status(201).json({
            success: true,
            message: 'Submission created successfully',
            data: createdSubmission
        } as SuccessResponse);
    } catch (error) {
        console.error('Error submitting challenge:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to submit challenge'
        } as ErrorResponse);
    }
}

export const getUserSubmissionByChallengeId = async (
    req: Request<{},{},{}, {challengeId: string}> & {userId? : string},
    res: Response<SuccessResponse | ErrorResponse>
) => {
 try {
    const challengeId = req.query.challengeId;
    if (!challengeId) {
        return res.status(400).json({
          success: false,
          message: "Challenge Id is required"
        } as ErrorResponse)
    }

    const userId = req.userId as string
    const submission = await fetchSubmissionByChallengeIdAndUserId(challengeId, userId);

    if (!submission) {
        return res.status(404).json({
            success: false,
            message: "submission not found"
          } as ErrorResponse);
    }
    
    return res.status(200).json({
       success: true,
       message: "Submission fetched successfully",
       data : submission,
    } as SuccessResponse);
 } catch (error) {
    console.error("error fetching submission", error);
    return res.status(500).json({
        success: false,
        message: "Internal Server Error"
      } as ErrorResponse)
 }
}

export const getLastTenUserSubmissions = async (req: Request & {userId?: string}, res: Response<SuccessResponse | ErrorResponse>) => {
 try {
    const userId = req.userId as string;
    const submissions = await fetchLastTenSubmissionsByUserId(userId); 

    return res.status(200).json({
        success: true,
        message: "Submissions fetched successfully",
        data : submissions,
     } as SuccessResponse);

 } catch (error) {
    console.error("error fetching submissions", error);
    return res.status(500).json({
        success: false,
        message: "Internal Server Error"
      } as ErrorResponse)
 }
}

export const getAllUserSubmissions = async(req: Request & {userId?:string}, res: Response<SuccessResponse | ErrorResponse>) => {
    try {
        const userId = req.userId as string;
        const submissions = await fetchAllSubmissions(userId);
        return res.status(200).json({
            success: true,
            message: "Submissions fetched successfully",
            data : submissions,
         } as SuccessResponse);
    } catch (error) {
        console.error("error fetching submissions", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
          } as ErrorResponse)
    }
}

export const getSubmissionBySubmissionId = async(req: Request<{},{},{},{submissionId: string}>, res: Response<SuccessResponse | ErrorResponse>) => {
    try {
        const submissionId = req.query.submissionId;
        if (!submissionId) {
            return res.status(400).json({
              success: false,
              message: "Submission Id is required"
            } as ErrorResponse);
        }

        const submission = await fetchSubmissionBySubmissionId(submissionId);
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "submission not found"
              } as ErrorResponse);
        }

        const submissionWithChallenge: SubmissionWithChallenge = {
            ...submission,
        };

        if (submission.isChallengeExists) {
            const challenge = await getChallengeById(submission.challengeId);
            if (!challenge) {
                return res.status(404).json({
                    success: false,
                    message: "challenge not found"
                } as ErrorResponse);
            }

            submissionWithChallenge.challengeName = challenge.title;
        }

        return res.status(200).json({
            success: true,
            message: "Submissions fetched successfully",
            data : submissionWithChallenge,
         } as SuccessResponse);    
    } catch (error) {
        console.error("error fetching submission", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
          } as ErrorResponse)
    }
}

export const updateSubmissionStatusController = async(req: Request<{submissionId: string},{},updateSubmissionStatusRequest>, res: Response<SuccessResponse | ErrorResponse>) => {
    try {
        const submissionId = req.params.submissionId;
        if (!submissionId) {
            return res.status(400).json({
                success: false,
                message: "Submission Id is required"
            } as ErrorResponse);
        }

        const result = updateSubmissionStatusSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error.issues[0]?.message || 'Invalid request body'
            } as ErrorResponse);
        }

        const validatedData = result.data;
        const submission = await fetchSubmissionBySubmissionId(submissionId);
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "Submission not found"
            } as ErrorResponse);
        }
        
        if (submission.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: `Submission is already settled with ${submission.status} status`
            } as ErrorResponse);
        }

        const updatedSubmission = await updateSubmissionStatus(submissionId, validatedData.status);
        if (!updatedSubmission) {
            return res.status(404).json({
                success: false,
                message: "failed to update submission status"
            } as ErrorResponse);
        }

        const user = await getUserById(submission.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            } as ErrorResponse);
        }

        let userFields: Partial<User> = {
            challengesInReview: user.challengesInReview-1,
        };

        if (validatedData.status === "COMPLETED"){
            let challengePoints = 0;
            if (!submission.isChallengeExists){
                challengePoints = 100;
            } else {
                const challenge = await getChallengeById(submission.challengeId);
                if (!challenge) {
                    return res.status(404).json({
                        success: false,
                        message: "Challenge not found"
                    } as ErrorResponse);
                }
                challengePoints = challenge.points;
            }
    
            userFields["challengesCompleted"] = user.challengesCompleted+1;
            userFields["totalPointsEarned"] = user.totalPointsEarned + challengePoints;
            userFields["currentPoints"] = user.currentPoints + challengePoints;            
        }


        const updatedUser = await updateUserWithSpecificFields(user.id, userFields);
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "failed to update user"
            } as ErrorResponse);
        }

        return res.status(200).json({
            success: true,
            message: "Submission status updated successfully",
            data: updatedSubmission
        } as SuccessResponse);
        
    } catch (error) {
        console.error("error updating submission status", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
          } as ErrorResponse)
    }
}