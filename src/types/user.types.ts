import { User } from "@prisma/client";
import { z } from 'zod';

// Zod schema for registering user
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
    interests: z.array(z.int())
        .min(4, 'At least 4 interests are required')
});

export type CreateUserRequest = z.infer<typeof createUserSchema>;

export type UserResponse = Omit<User, 'password'>;

export type GetUserResponse = {
    user: UserResponse,
    message: string,
    success: boolean
}

// Zod schema for login user
export const loginUserSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().nonempty('Password is required')
})

export type LoginUserRequest = z.infer<typeof loginUserSchema>

export type LoginOrRegisterUserResponse = {
    token: string,
    message: string,
    success: boolean
}

export const leaderboardQuerySchema = z.object({
    page: z.string()
           .transform(page => parseInt(page))
           .pipe(z.number().positive())
           .optional()
           .default(1),
    lowerAge: z.string()
         .transform(age => parseInt(age))
         .pipe(z.number().positive())
         .optional()
         .default(0),
    upperAge: z.string()
         .transform(age => parseInt(age))
         .pipe(z.number().positive())
         .optional()
         .default(0),
    city: z.string()
         .optional(),
    fetchUser: z.string()
                .transform(val => val === "true")
                .optional()
                .default(false),
});

export type LeaderboardQueryRequest = z.infer<typeof leaderboardQuerySchema>;
