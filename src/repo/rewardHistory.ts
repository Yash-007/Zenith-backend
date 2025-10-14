import { PrismaClient, RewardHistory, RewardStatus } from "@prisma/client";
import { CreateUserRewardEntryRequest } from "../types/reward.types";

const prisma = new PrismaClient();

export const createUserReward = async(userId: string, rewardStatus: RewardStatus, userRewardEntry: CreateUserRewardEntryRequest): Promise<RewardHistory | null> => {
    try {
        const reward = await prisma.rewardHistory.create({
            data: {
                userId:userId,
                status: rewardStatus,
                ...userRewardEntry,
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

export const updateUserRewardStatus = async(rewardId: string, rewardStatus: RewardStatus) => {
    try {
    const userReward = await prisma.rewardHistory.update({
        where: {
            id: rewardId
        },
        data: {
            status: rewardStatus
        }
    });
        return userReward as RewardHistory;
    } catch (error) {
        console.error('Error updating user reward status in the db:', error);
        throw error;
    }
}