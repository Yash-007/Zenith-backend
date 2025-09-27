import { Request, Response } from "express";
import { ErrorResponse, SuccessResponse } from "../types/common.types";
import { answerUserQuerySchema } from "../types/chat.types";
import { fetchUserChats, storeUserQueryAndResponse } from "../repo/chat";
import { answerQuery } from "../clients/gemini";


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
        const response = await answerQuery(query);
        const chat = await storeUserQueryAndResponse(userId, query, response);
        if (!chat) {
            console.error('Failed to store user query and response');
            return res.status(200).json({
                message: 'User query answered successfully',
                success: true,
                data: {
                    query,
                    response,
                }
            } as SuccessResponse);
        }
        const {query: chatQuery, response: chatResponse} = chat;
        return res.status(200).json({
            message: 'User query answered successfully',
            success: true,
            data: {
                query: chatQuery,
                response: chatResponse
            }
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
        const chats = await fetchUserChats(userId);

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