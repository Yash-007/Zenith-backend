import {z} from "zod";

export const submitSubmissionSchema = z.object({
    userId: z.string(),
    challengeId: z.string(),
    status: z.enum(["PENDING", "COMPLETED", "REJECTED"]),
    isChallengeExists: z.preprocess((val) => val === "true", z.boolean()),
    text: z.string().optional()
}); 

export type submitSubmissionRequest = z.infer<typeof submitSubmissionSchema>

export interface createSubmissionRequest extends submitSubmissionRequest {
    proofs : {
        text?: string,
        images?: string[],
        videos?: string[],
    }
}