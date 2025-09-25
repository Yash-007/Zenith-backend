import { PrismaClient, RewardHistory } from "@prisma/client";
import { CreateUserRewardEntryRequest } from "../types/reward.types";

const prisma = new PrismaClient();

export const createUserReward = async(userId: string, userRewardEntry: CreateUserRewardEntryRequest): Promise<RewardHistory | null> => {
    try {
        const reward = await prisma.rewardHistory.create({
            data: {
                ...userRewardEntry,
                userId:userId
            }
        })
        return reward;
    } catch (error) {
        console.error('Error creating user reward entry in the db:', error);
        throw error;
    }
}

export const fetchUserRewardsHistory = async(userId: string): Promise<RewardHistory[] | null> => {
    try {
        const userRewardsHistory = await prisma.rewardHistory.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                rewardedAt: "desc"
            }
        });
        return userRewardsHistory;
    } catch (error) {
        console.error('Error fetching user rewards history from the db:', error);
        throw error;
    }
}