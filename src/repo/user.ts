import { PrismaClient, User } from "@prisma/client";
import { CreateUserRequest } from "../types/user.types";
const prisma = new PrismaClient();

export const createUser = async (userRequest: CreateUserRequest): Promise<User> => {
    try {
        const userData = {
            ...userRequest,
            avatar: userRequest.avatar || null,
            age: userRequest.age || null,
            gender: userRequest.gender || null,
            city: userRequest.city || null   
        }
    
        const newUser = await prisma.user.create({
            data: userData
        });
        return newUser as User;   
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

export const getUserByEmail = async(email: string): Promise<User> =>{
    try {
        const user = await prisma.user.findUnique({
           where: {
               email: email
           }
        });
        return user as User;
    } catch (error) {
        console.error('Error getting user by email:', error);
        throw error;
    }
}

export const getUserById = async(userId: string): Promise<User> => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        return user as User;
    } catch (error) {
        console.error('Error getting user by id:', error);
        throw error;
    }
}