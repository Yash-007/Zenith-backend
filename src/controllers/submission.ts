import { submitSubmissionRequest, submitSubmissionSchema } from "../types/submission.types";
import { ErrorResponse, SuccessResponse } from "../types/common.types";
import { RequestHandler } from "express-serve-static-core";
import { createSubmission, fetchLastTenSubmissionsByUserId, fetchSubmissionByChallengeIdAndUserId } from "../repo/submission";
import { Request, Response } from "express";

export const submitChallengeController: RequestHandler = async (req, res) => {
    try {
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
            proofs: {
                text: validatedData.text || '',
                images,
                videos
            }
        };
        delete submission.text
       const createdSubmission = await createSubmission(submission);

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

export const getLastTenUserSubmissions = async (req: Request & {userId?: string}, res: Response) => {
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

export const getAllUserSubmissions = async(req: Request, res: Response) => {
    try {
        // const submissions = 
    } catch (error) {
        
    }
}