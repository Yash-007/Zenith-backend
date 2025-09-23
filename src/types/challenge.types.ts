import { Challenge, Submission } from "@prisma/client";

export type CreateChallengeRequest = {
    title: string;
    description: string;
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
    challengesByInterest: Map<number, Challenge[]>,
    recentPendingSubmissionChallenge?: Challenge | null
}