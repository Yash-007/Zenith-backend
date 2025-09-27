import { Request, Response } from "express";
import { ErrorResponse, SuccessResponse } from "../types/common.types";
import { CreateUserRewardEntryRequest, createUserRewardEntrySchema } from "../types/reward.types";
import { createUserReward, fetchUserRewardsHistory } from "../repo/rewardHistory";
import { getUserById, updateUserWithSpecificFields } from "../repo/user";

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

        const userFields = {
            currentPoints: user.currentPoints - validatedData.pointsRewarded,
            pointsUsed: user.pointsUsed + validatedData.pointsRewarded,
        }
        await updateUserWithSpecificFields(userId, userFields);

        const userRewardEntry = await createUserReward(userId ,validatedData);
        if (!userRewardEntry) {
            return res.status(400).json({
                message: 'Failed to create user reward entry',
                success: false
            } as ErrorResponse);
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