import { Request, Response } from "express";
import { createUser } from "../repo/user";
import { createUserSchema, CreateUserRequest, CreateUserResponse } from "../types/user.types";
import bcrypt from "bcrypt";

const saltRounds = 10;

export const CreateUserController = async (
    req: Request<{}, CreateUserResponse, CreateUserRequest>, 
    res: Response<CreateUserResponse>
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
        
        const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds);
        const userData = {
            ...validatedData,
            password: hashedPassword
        };

        const newUser = await createUser(userData);
        
        const { password, ...userWithoutPassword } = newUser;
        const createUserResponse: CreateUserResponse = {
            user: userWithoutPassword,
            message: 'User created successfully',
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