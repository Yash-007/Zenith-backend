import { submitSubmissionRequest, submitSubmissionSchema } from "../types/submission.types";
import { ErrorResponse, SuccessResponse } from "../types/common.types";
import { RequestHandler } from "express-serve-static-core";
import { createSubmission } from "../repo/submission";

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