import { Request, Response } from "express";
import { createUser, fetchLeaderboard, fetchUserRankLeaderboard, getUserByEmail, getUserById } from "../repo/user";
import { createUserSchema, loginUserSchema, CreateUserRequest, GetUserResponse, LoginUserRequest, LoginOrRegisterUserResponse, UserResponse, LeaderboardQueryRequest, leaderboardQuerySchema } from "../types/user.types";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { ErrorResponse, SuccessResponse } from "../types/common.types";
import { getLeaderboardCacheKey, getUserRankLeaderboardCacheKey } from "../utils/functions";
import redisClient from "../clients/redis";

const saltRounds = 10;

export const CreateUserController = async (
    req: Request<{}, LoginOrRegisterUserResponse, CreateUserRequest>, 
    res: Response<LoginOrRegisterUserResponse>
) => {
    try {
        // Validate request body against the schemas
        const result = createUserSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ 
                success: false,
                message: result.error.issues[0]?.message || 'Invalid request body'
            } as any);
        }

        const validatedData = result.data;

        if (validatedData.city) {
            validatedData.city = validatedData.city.toUpperCase();
        }
        
        const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds);
        const userData = {
            ...validatedData,
            password: hashedPassword
        };

        const newUser = await createUser(userData);
        const token = jwt.sign({userId: newUser.id}, process.env.JWT_SECRET as string, {expiresIn: '7d'})
        
        const createUserResponse: LoginOrRegisterUserResponse = {
            token,
            message: 'User registered successfully',
            success: true
        }
        res.status(201).json(createUserResponse);
    } catch (error: any) {
        if (error?.code === 'P2002' && error?.meta?.target?.includes('email')) {
            return res.status(400).json({ 
                message: 'Email already exists',
                success: false
            } as any);
        }
        console.error('Error creating user:', error);
        res.status(500).json({ 
            message: 'Failed to create user',
            success: false
        } as any);
    }
}

export const LoginUserController = async (
    req: Request<{}, LoginOrRegisterUserResponse | ErrorResponse, LoginUserRequest>,
    res: Response<LoginOrRegisterUserResponse | ErrorResponse>
) => {
    try {
        console.log(req.body);
        const result = loginUserSchema.safeParse(req.body);
        if (!result.success) {
            console.log(result.error.issues);
            return res.status(400).json({
                message: result.error.issues[0]?.message || 'Invalid request body',
                success: false
            } as ErrorResponse);
        }
        const {email, password} = result.data;
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(400).json({
                message: 'User not found',
                success: false
            } as ErrorResponse);
        }

      const isValidPassword =  await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({
            message: 'Invalid password',
            success: false
        } as ErrorResponse);
      }

      const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET as string, {expiresIn: '7d'})
      
      const LoginUserResponse: LoginOrRegisterUserResponse = {
        token,
        message: 'User Logged in successfully',
        success: true
      }
      return res.status(200).json(LoginUserResponse);
 
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({
            message: 'Failed to login user',
            success: false
        } as ErrorResponse);
    }
}

export const GetUserController = async (req: Request & {userId?: string}, res: Response<UserResponse | ErrorResponse>) => {
    try {
        const user = await getUserById(req.userId as string)
        if (!user) {
            return res.status(400).json({
                message: 'User not found',
                success: false
            } as ErrorResponse);
        }
        const {password, ...userWithoutPassword} = user;
        const getUserReponse: GetUserResponse = {
            user: userWithoutPassword,
            message: 'User fetched successfully',
            success: true
        }
        return res.status(200).json(getUserReponse);
    } catch (error) {
        console.error('Error getting user:', error);
        return res.status(500).json({
            message: 'Failed to get user',
            success: false
        } as ErrorResponse);
    }
}

export const getLeaderboardController = async(req: Request<{},{},{},LeaderboardQueryRequest> & {userId?: string}, res: Response<SuccessResponse | ErrorResponse>) => {
    try {
        const result = leaderboardQuerySchema.safeParse(req.query);
        if (!result.success) {
            return res.status(400).json({
                message: result.error.issues[0]?.message || 'Invalid query params',
                success: false
            } as ErrorResponse);
        }

        let {page, lowerAge, upperAge, city, fetchUser} = result.data;
        page = page || 1;
        const limit = 10;
        if (!fetchUser) {
            const cacheKey = getLeaderboardCacheKey(page, lowerAge, upperAge, city as string);
            const cachedLeaderboard = await redisClient.get(cacheKey);
            if (cachedLeaderboard) {
                return res.status(200).json({
                    success: true,
                    message: 'Leaderboard fetched successfully',
                    data: JSON.parse(cachedLeaderboard)
                } as SuccessResponse);
            }
            const leaderboard = await fetchLeaderboard(page, limit, lowerAge, upperAge, city as string);
            if (!leaderboard) {
                return res.status(400).json({
                    message: 'Leaderboard not found',
                    success: false
                } as ErrorResponse);
            }

            await redisClient.setex(cacheKey, 60*15, JSON.stringify(leaderboard));

            return res.status(200).json({
                success: true,
                message: 'Leaderboard fetched successfully',
                data: leaderboard
            } as SuccessResponse);
        }

        const user = await getUserById(req.userId as string);
        if (!user) {
            return res.status(400).json({
                message: 'User not found',
                success: false
            } as ErrorResponse);
        }

        const cacheKey = getUserRankLeaderboardCacheKey(user.id);
        const cachedLeaderboard = await redisClient.get(cacheKey);

        if (cachedLeaderboard) {
            return res.status(200).json({
                success: true,
                message: 'Leaderboard fetched successfully',
                data: JSON.parse(cachedLeaderboard)
            } as SuccessResponse);
        }
        
        const leaderboard = await fetchUserRankLeaderboard(user, limit);
        if (!leaderboard) {
            return res.status(400).json({
                message: 'Leaderboard not found',
                success: false
            } as ErrorResponse);
        }
        await redisClient.setex(cacheKey, 60*15, JSON.stringify(leaderboard));

        return res.status(200).json({
            success: true,
            message: 'Leaderboard fetched successfully',
            data: leaderboard
        } as SuccessResponse);

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return res.status(500).json({
            message: 'Failed to fetch leaderboard',
            success: false
        } as ErrorResponse);
    }
}
