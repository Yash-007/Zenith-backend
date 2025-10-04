import { Request, Response } from "express";
import { ErrorResponse, SuccessResponse } from "../types/common.types";
import { ChallengeWithSubmission, CreateChallengeRequest, UserChallengesResponse } from "../types/challenge.types";
import { createChallenge, getChallengeById, fetchAllChallenges, getChallengesByCategoryExcluding} from "../repo/challenge";
import { getUserById } from "../repo/user";
import { fetchAllSubmissions, fetchSubmissionByChallengeIdAndUserId, fetchUserRecentPendingSubmissionChallengeId } from "../repo/submission";
import { Category, Challenge } from "@prisma/client";
import { fetchAllCategories } from "../repo/category";

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

export const getChallengById = async (req: Request<{}, {}, {}, {id: string}> & {userId?: string}, res: Response<SuccessResponse | ErrorResponse>) => {
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

        const submission = await fetchSubmissionByChallengeIdAndUserId(challengeId as string, req.userId as string);
        const challengeWithSubmission: ChallengeWithSubmission = {
            ...challenge,
            isSubmitted: false
        };

        if (submission) {
            challengeWithSubmission.isSubmitted = true;
            challengeWithSubmission.submissionStatus = submission.status;
            challengeWithSubmission.submissionId = submission.id;
        }

        return res.status(200).json({   
            message: 'Challenge fetched successfully',
            success: true,
            data: challengeWithSubmission
        } as SuccessResponse);
    } catch (error) {
        console.error('Error getting challenge by id:', error);
        return res.status(500).json({
            message: 'Failed to get challenge by id',
            success: false
        } as ErrorResponse);
    }
}

export const getAllChallenges = async (req: Request, res: Response<ErrorResponse | SuccessResponse>) => {
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

export const getUserChallenges = async(req: Request & {userId?: string}, res: Response) => {
  try {
    const userId = req.userId as string;
    const user = await getUserById(userId);

    const userInterests = user.interests;
    
    if(userInterests.length === 0) {
        return res.status(200).json({
            success: false,
            message: "no user interests found"
        } as ErrorResponse);
    }

    const allCategories = await fetchAllCategories() as Category[];
    const allCategoriesIds = allCategories?.map((category)=> category.id) || [];

    const userSubmissions = await fetchAllSubmissions(userId);
    const userSubmittedChallengeIds = userSubmissions?.map((sub)=> sub.challengeId) || [];

    const getChallengesByInterestsPromises: Promise<Challenge[]>[] = [];
    
    allCategoriesIds.forEach((category)=>{
        getChallengesByInterestsPromises.push(getChallengesByCategoryExcluding(Number(category), userSubmittedChallengeIds))
    });

    const challengesforOtherCategories: Challenge[] = [];

    const allChallenges = await Promise.all(getChallengesByInterestsPromises);
    const challengesMappedWithInterests: {[key: number]: Challenge[]} = {};
    allChallenges.forEach((challenges, idx)=> {
        if (userInterests.includes(allCategoriesIds[idx] as number)) {
            challengesMappedWithInterests[allCategoriesIds[idx] as number] = challenges
        } else {
            challengesforOtherCategories.push(...challenges);
        }
  });

  challengesMappedWithInterests[-1] = challengesforOtherCategories;


    const finalResp: UserChallengesResponse = {
        challengesByInterest: challengesMappedWithInterests,
    }

    const userRecentPendingSubmissionChallengeId = await fetchUserRecentPendingSubmissionChallengeId(userId);
    if (userRecentPendingSubmissionChallengeId) {
        const userRecentPendingSubmissionChallenge = await getChallengeById(userRecentPendingSubmissionChallengeId.challengeId)
        finalResp.recentPendingSubmissionChallenge = userRecentPendingSubmissionChallenge;
    }


    return res.status(200).json({
       success: true,
       message: "User Challenges fetched successfully",
       data: finalResp,
    } as SuccessResponse);

  } catch (error) {
    console.error("Error getting challenges")
    return res.status(500).json({
      message: "Failed to get challenges",
      success: false,
    } as ErrorResponse);
  }
}