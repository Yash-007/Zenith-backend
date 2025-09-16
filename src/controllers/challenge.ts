import { Request, Response } from "express";
import { ErrorResponse } from "../types/common.types";
import { CreateChallengeRequest, CreateChallengeResponse } from "../types/challenge.types";
import { createChallenge } from "../repo/challenge";

export const createChallengeController = async(req: Request<{}, {}, CreateChallengeRequest>, res: Response) => {
    try {
        const createChallengeRequest = req.body;
        const challenge = await createChallenge(createChallengeRequest)
        
        const createChallengeResponse: CreateChallengeResponse = {
            challenge,
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