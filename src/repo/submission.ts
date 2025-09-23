import {PrismaClient, Submission } from "@prisma/client";
import { createSubmissionRequest, submitSubmissionRequest } from "../types/submission.types";

const prisma = new PrismaClient();

export const createSubmission = async(submission: createSubmissionRequest): Promise<Submission> => {
    try {
        const createdSubmission = await prisma.submission.create({
            data: {
                ...submission,
                proofs: {
                    text: submission.proofs.text || '',
                    images: submission.proofs.images || [],
                    videos: submission.proofs.videos || [],
                }
            }
        })

        return createdSubmission as Submission;
    } catch (error) {
        console.error("error while creating submission", error)
        throw error;
    }
}

export const fetchSubmissionByChallengeIdAndUserId = async(challengeId: string, userId: string): Promise<Submission> => {
    try {
        const submission = await prisma.submission.findUnique({
            where: {
                userId_challengeId : {
                    userId: userId,
                    challengeId: challengeId,
                }
            }
        });
        return submission as Submission;
    } catch (error) {
        console.error("error fetching submission by id from the db", error)
        throw error;
    }
}


export const fetchLastTenSubmissionsByUserId = async(userId: string) => {
    try {
        const submissions = await prisma.submission.findMany({
            where: {
                userId: userId
            },
            take: 10,
        });
        return submissions;
    } catch (error) {
        console.error("error fetching user submissions from db", error);
        throw error;
    }
}