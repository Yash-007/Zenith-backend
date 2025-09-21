import { Request, Response } from "express";
import { ErrorResponse, SuccessResponse } from "../types/common.types";
import { CreateChallengeRequest, CreateChallengeResponse } from "../types/challenge.types";
import { createChallenge, getChallengeById, fetchAllChallenges} from "../repo/challenge";

export const createChallengeController = async(req: Request<{}, {}, CreateChallengeRequest>, res: Response<SuccessResponse | ErrorResponse>) => {
    try {
        const createChallengeRequest = req.body;
        const challenge = await createChallenge(createChallengeRequest)
        
        const createChallengeResponse: SuccessResponse = {
            data: challenge,
            message: 'Challenge created successfully',
            success: true
        }
        res.status(201).json(createChallengeResponse);
    } catch (error) {
        console.error('Error creating challenge:', error);
        res.status(500).json({
            message: 'Failed to create challenge',
            success: false
        } as ErrorResponse);
    }
}

export const getChallengById = async (req: Request<{}, {}, {}, {id: string}>, res: Response<SuccessResponse | ErrorResponse>) => {
    try {
        const challengeId = req.query.id;
        if (!challengeId) {
            return res.status(400).json({
                message: 'Challenge id is required',
                success: false
            } as ErrorResponse);
        }

        const challenge = await getChallengeById(challengeId as string);
        if (!challenge) {
            return res.status(404).json({
                success:false, 
                message: 'Challenge not found'
            } as ErrorResponse);
        }

        return res.status(200).json({   
            message: 'Challenge fetched successfully',
            success: true,
            data: challenge
        } as SuccessResponse);
    } catch (error) {
        console.error('Error getting challenge by id:', error);
        return res.status(500).json({
            message: 'Failed to get challenge by id',
            success: false
        } as ErrorResponse);
    }
}

export const getAllChallenges = async (req: Request, res: Response) => {
 try {
     const challenges = await fetchAllChallenges();
     return res.status(200).json({
        success: true,
        message: "challenges found successfully",
        data: challenges
     } as SuccessResponse)
 } catch (error) {
    console.error("Error getting challenges")
    return res.status(500).json({
      message: "Failed to get challenges",
      success: false,
    } as ErrorResponse)
 }
}