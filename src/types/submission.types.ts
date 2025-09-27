import {z} from "zod";

export const submitSubmissionSchema = z.object({
    challengeId: z.string(),
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