import { Challenge, Submission } from "@prisma/client";
import {z} from "zod";

export const submitSubmissionSchema = z.object({
    challengeId: z.string(),
    challengeName: z.string(),
    status: z.enum(["PENDING", "COMPLETED", "REJECTED"]),
    isChallengeExists: z.preprocess((val) => val === "true", z.boolean()),
    text: z.string().optional()
}); 

export type submitSubmissionRequest = z.infer<typeof submitSubmissionSchema>

export interface createSubmissionRequest extends submitSubmissionRequest {
    userId: string,
    proofs : {
        text?: string,
        images?: string[],
        videos?: string[],
    }
}

export const updateSubmissionStatusSchema = z.object({
    status: z.enum(["COMPLETED", "REJECTED"], {
        error:"Status is required and must be one of COMPLETED, REJECTED"
    }),
});

export type SubmissionData = {
    submissions: Submission[],
    totalPages: number
    currentPage: number
}

export type updateSubmissionStatusRequest = z.infer<typeof updateSubmissionStatusSchema>