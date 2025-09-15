import { User } from "@prisma/client";
import { z } from 'zod';

// Zod schema for validation
export const createUserSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    avatar: z.string().optional(),
    age: z.number().optional(),
    gender: z.string().optional(),
    city: z.string().optional(),
    interests: z.array(z.string())
        .min(4, 'At least 4 interests are required')
});

export type CreateUserRequest = z.infer<typeof createUserSchema>;

export type UserResponse = Omit<User, 'password'>;

export type CreateUserResponse = {
    user: UserResponse,
    message: string,
    success: boolean
}