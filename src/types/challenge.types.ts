import { Challenge, Submission, SubmissionStatus } from "@prisma/client";

export type CreateChallengeRequest = {
    title: string;
    description: string;
    longDescription: string;
    category:number;
    time:number;
    points:number;
    level:number;
    submissionType:string;
}

export type CreateChallengeResponse = {
    message: string;
    success: boolean;
    challenge: Challenge;
}

export type UserChallengesResponse = {
    challengesByInterest: {
        [key: number]: Challenge[]
    }
    recentPendingSubmissionChallenge?: Challenge | null
}

export interface ChallengeWithSubmission extends Challenge {
    isSubmitted: boolean;
    submissionStatus?: SubmissionStatus;
    submissionId?: string;
}