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