import { Request, Response } from "express";
import { ErrorResponse, SuccessResponse } from "../types/common.types";
import { CreateUserRewardEntryRequest, createUserRewardEntrySchema } from "../types/reward.types";
import { createUserReward, fetchUserRewardByRewardId, fetchUserRewardsHistory, updateUserRewardStatus } from "../repo/rewardHistory";
import { getUserById, updateUserWithSpecificFields } from "../repo/user";
import { createTransaction } from "./transaction";
import { CreateTransactionRequest } from "../types/transaction.types";
import { RewardStatus } from "@prisma/client";

export const createUserRewardEntry = async(req: Request<{}, {}, CreateUserRewardEntryRequest> &  {userId?: string}, res: Response<SuccessResponse | ErrorResponse>) => {
    try {
        const result = createUserRewardEntrySchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: result.error.issues[0]?.message || 'Invalid request body',
                success: false
            } as ErrorResponse);
        }

        const validatedData = result.data;

        if (validatedData.pointsRewarded != 3000 || validatedData.amount != 200) {
            return res.status(400).json({
                message: 'Invalid points rewarded or amount',
                success: false
            } as ErrorResponse);
        } 
        
        const userId = req.userId as string;
        const user = await getUserById(userId);
        if (!user) {
            return res.status(400).json({
                message: 'User not found',
                success: false
            } as ErrorResponse);
        }

        if (user.currentPoints < validatedData.pointsRewarded) {
            return res.status(400).json({
                message: 'User does not have enough points',
                success: false
            } as ErrorResponse);
        }

        let rewardStatus: RewardStatus = RewardStatus.PENDING;
        const userRewardEntry = await createUserReward(userId, rewardStatus, validatedData);
        if (!userRewardEntry) {
            return res.status(400).json({
                message: 'Failed to create user reward entry',
                success: false
            } as ErrorResponse);
        }

        const createTransactionRequest: CreateTransactionRequest = {
            vpaAddress: validatedData.vpaAddress,
            amount: validatedData.amount,
            rewardId: userRewardEntry.id,
        }

        const transaction = await createTransaction(createTransactionRequest, userId);
        if (!transaction) {
            return res.status(500).json({
                message: 'Failed to create transaction',
                success: false
            } as ErrorResponse);
        }

        if (transaction.status === "processed"){
            rewardStatus = RewardStatus.COMPLETED;
        } else if (transaction.status === "failed" || transaction.status === "cancelled" || transaction.status === "reversed" || transaction.status === "rejected") {
            rewardStatus = RewardStatus.FAILED;
        }

        if (rewardStatus !== RewardStatus.FAILED) {
            const userFields = {
                currentPoints: user.currentPoints - validatedData.pointsRewarded,
                pointsUsed: user.pointsUsed + validatedData.pointsRewarded,
            }
            await updateUserWithSpecificFields(userId, userFields);
        }

        if (rewardStatus !== RewardStatus.PENDING) {
        const updatedUserReward = await updateUserRewardStatus(userRewardEntry.id, rewardStatus);
        if (!updatedUserReward) {
            return res.status(400).json({
                message: 'Failed to update user reward status',
                success: false
            } as ErrorResponse);
        }
    }
        return res.status(200).json({
            message: 'User reward entry created successfully',
            success: true,
            data: userRewardEntry
        } as SuccessResponse);
    } catch (error) {
        console.error('Error creating user reward entry:', error);
        res.status(500).json({
            message: 'Failed to create user reward entry',
            success: false
        } as ErrorResponse);
    }
}

export const getUserRewardsHistory = async(req: Request & {userId?: string}, res: Response<SuccessResponse | ErrorResponse>) => {
    try {
        const userId = req.userId as string;
        const userRewardsHistory = await fetchUserRewardsHistory(userId);
        return res.status(200).json({
            message: 'User rewards history fetched successfully',
            success: true,
            data: userRewardsHistory
        } as SuccessResponse);
    } catch (error) {
        console.error('Error getting user rewards history:', error);
        return res.status(500).json({
            message: 'Failed to get user rewards history',
            success: false
        } as ErrorResponse);
    }
}

export const getUserRewardByRewardId = async(req: Request<{rewardId: string}>, res: Response<SuccessResponse | ErrorResponse>) => {
    try {
        const rewardId = req.params.rewardId;
        const userReward = await fetchUserRewardByRewardId(rewardId);
        if (!userReward) {
            return res.status(404).json({
                message: 'User reward not found',
                success: false
            } as ErrorResponse);
        }
        return res.status(200).json({
            message: 'User reward fetched successfully',
            success: true,
            data: userReward
        } as SuccessResponse);
    } catch (error) {
        console.error('Error getting user reward by reward id:', error);
        return res.status(500).json({
            message: 'Failed to get user reward by reward id',
            success: false
        } as ErrorResponse);
    }
}