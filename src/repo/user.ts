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