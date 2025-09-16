import { CreateChallengeRequest } from "../types/challenge.types";
import { Challenge, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createChallenge = async(createChallengeRequest: CreateChallengeRequest): Promise<Challenge> => {
    try {
        const challenge = await prisma.challenge.create({
            data: {
                ...createChallengeRequest
            }
        }); 
        return challenge as Challenge;
    } catch (error) {
        console.error('Error creating challenge:', error);
        throw error;
    }
}