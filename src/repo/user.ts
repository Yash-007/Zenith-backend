import { PrismaClient, User } from "@prisma/client";
import { CreateUserRequest } from "../types/user.types";
const prisma = new PrismaClient();

export const createUser = async (userRequest: CreateUserRequest): Promise<User> => {
    const userData = {
        ...userRequest,
        avatar: userRequest.avatar || null,
        age: userRequest.age || null,
        gender: userRequest.gender || null,
        city: userRequest.city || null,
    }

    const newUser = await prisma.user.create({
        data: userData
    });
    return newUser;
}

export const getUserByEmail = async(email: string): Promise<User | null> =>{
    try {
        const user = await prisma.user.findUnique({
           where: {
               email: email
           }
        });
        return user;
    } catch (error) {
        console.error('Error getting user by email:', error);
        throw error;
    }
}

export const getUserById = async(userId: string): Promise<User | null> => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        return user
    } catch (error) {
        console.error('Error getting user by id:', error);
        throw error;
    }
}