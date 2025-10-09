import { Request, Response } from "express";
import { ErrorResponse, SuccessResponse } from "../types/common.types";
import { QueryType, answerUserQuerySchema, ChatResponse } from "../types/chat.types";
import { fetchUserChats, storeUserQueryAndResponse } from "../repo/chat";
import { determineQueryType, getPromptForQueryType, getUserContextString } from "../utils/chat.utils";
import { getUserById } from "../repo/user";
import { answerQuery } from "../clients/gemini";
import { writeContextToFile } from "../utils/file.utils";
import { getUserChatsCacheKey } from "../utils/functions";
import redisClient from "../clients/redis";

export const answerUserQuery = async(req: Request & {userId?: string}, res: Response) => {
    try {
        const result = answerUserQuerySchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: result.error.issues[0]?.message || 'Invalid request body',
                success: false
            } as ErrorResponse);
        }

        const { query } = result.data;
        const userId = req.userId as string;

        const cacheKey = getUserChatsCacheKey(userId);
        await redisClient.del(cacheKey);
        // First, determine query type
        const queryType = await determineQueryType(query);

        // Get user context if needed
        let userContext = "";
        let response = "";
        if (queryType === QueryType.USER_INFO) {
            const user = await getUserById(userId);
            if (!user) {
                return res.status(404).json({
                    message: 'User not found',
                    success: false
                } as ErrorResponse);
            }
            userContext = await getUserContextString(user);
            
            // Temporarily save context to file for verification
            // await writeContextToFile(userContext, userId);
        }

            // Get appropriate prompt and generate response
            const prompt = getPromptForQueryType(queryType, userContext);
            if (!prompt) {
                response = "I'm sorry, I can't answer that question.";
            } else {
            response = await answerQuery(prompt + "\nQuery: " + query);
            response = response.replace(/\*\*/g, '');
           }
        console.log("cleaned response", response);

        // Store in database
        const chat = await storeUserQueryAndResponse(userId, query, response);
        if (!chat) {
            return res.status(200).json({
                message: 'User query answered successfully',
                success: true,
                data: {
                    query,
                    response,
                    queryType: queryType
                } as ChatResponse
            } as SuccessResponse);
        }

        return res.status(200).json({
            message: 'User query answered successfully',
            success: true,
            data: {
                query: chat.query,
                response: chat.response,
                queryType: queryType
            } as ChatResponse
        } as SuccessResponse);
    } catch (error) {
        console.error('Error answering user query:', error);
        res.status(500).json({
            message: 'Failed to answer user query',
            success: false
        } as ErrorResponse);
    }
}

export const getUserChats = async(req: Request & {userId?: string}, res: Response) => {
    try {
        const userId = req.userId as string;
        const cacheKey = getUserChatsCacheKey(userId);
        const cachedChats = await redisClient.get(cacheKey);
        if (cachedChats) {
            return res.status(200).json({
                message: 'User chats fetched successfully',
                success: true,
                data: JSON.parse(cachedChats)
            } as SuccessResponse);
        }
        const chats = await fetchUserChats(userId);

        await redisClient.set(cacheKey, JSON.stringify(chats));

        return res.status(200).json({
            message: 'User chats fetched successfully',
            success: true,
            data: chats
        } as SuccessResponse);
    } catch (error) {
        console.error('Error fetching user chats:', error);
        res.status(500).json({
            message: 'Failed to fetch user chats',
            success: false
        } as ErrorResponse);
    }
}