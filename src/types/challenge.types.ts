import { Challenge } from "@prisma/client";

export type CreateChallengeRequest = {
    title: string;
    description: string;
    category:number;
    time:number;
    points:number;
    level:string;
    submissionType:string;
}

export type CreateChallengeResponse = {
    message: string;
    success: boolean;
    challenge: Challenge;
}