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

export const getChallengeById = async(id:string): Promise<Challenge> =>{
    try {
        const challenge = await prisma.challenge.findUnique({
            where:{
                id:id
            }
        })
        return challenge as Challenge;
    } catch (error) {
       console.error('Error getting challenge by id:', error);
       throw error;
    }
}

export const fetchAllChallenges = async() => {
    try {
        const challenges = await prisma.challenge.findMany();
        return challenges;
    } catch (error) {
       console.error("Error getting all challenges", error)
       throw error;   
    }
}