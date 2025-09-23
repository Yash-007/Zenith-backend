import {PrismaClient, Submission } from "@prisma/client";
import { createSubmissionRequest, submitSubmissionRequest } from "../types/submission.types";

const prisma = new PrismaClient();

export const createSubmission = async(submission: createSubmissionRequest): Promise<Submission | null> => {
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

        return createdSubmission;
    } catch (error) {
        console.error("error while creating submission", error)
        throw error;
    }
}

export const fetchSubmissionByChallengeIdAndUserId = async(challengeId: string, userId: string): Promise<Submission | null> => {
    try {
        const submission = await prisma.submission.findUnique({
            where: {
                userId_challengeId : {
                    userId: userId,
                    challengeId: challengeId,
                }
            }
        });
        return submission;
    } catch (error) {
        console.error("error fetching submission by id from the db", error)
        throw error;
    }
}


export const fetchLastTenSubmissionsByUserId = async(userId: string): Promise<Submission[]> => {
    try {
        const submissions = await prisma.submission.findMany({
            where: {
                userId: userId
            },
            take: 10,
            orderBy: {submittedAt: "desc"},
        });
        return submissions;
    } catch (error) {
        console.error("error fetching user submissions from db", error);
        throw error;
    }
}

export const fetchAllSubmissions = async(userId: string):Promise<Submission[]> => {
    try {
        const submissions = await prisma.submission.findMany();
        return submissions;
    } catch (error) {
        console.error("error fetching submissions from db", error);
        throw error;
    }
}

export const fetchSubmissionBySubmissionId = async(submissionId: string):Promise<Submission | null> => {
    try {
        const submission = await prisma.submission.findUnique({
            where: {
                id: submissionId,
            }
        });
        return submission;
    } catch (error) {
        console.error("error fetching submission from db", error);
        throw error;
    }
}

export const fetchUserRecentPendingSubmissionChallengeId = async(userId: string): Promise<{challengeId: string} | null> => {
    try {
        const challengeId = await prisma.submission.findFirst({
           select: {challengeId: true},
           where: {
            userId: userId,
            status: "PENDING",
            isChallengeExists: true,
           },
           orderBy: {submittedAt: "desc"}
        });

        return challengeId;
    } catch (error) {
        console.error("error fetching pending submission from db", error);
        throw error;
    }
}