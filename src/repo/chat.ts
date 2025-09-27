import { Chat, PrismaClient } from "@prisma/client";
import { tr } from "zod/v4/locales";

const prisma = new PrismaClient();

export const storeUserQueryAndResponse = async(userId: string, query: string, response: string): Promise<Chat | null> => {
    try {
        const chat = await prisma.chat.create({
            data: {
                userId,
                query,
                response
            }
        });
        return chat;
    } catch (error) {
        console.error('Error storing user query and response:', error);
        throw error;
    }
}

export const fetchUserChats = async(userId: string): Promise<Chat[] | null> => {
  try {
    const chats = await prisma.chat.findMany({
        where: {
            userId: userId
        },
        orderBy: {
            "createdAt": "asc"
        }
    });
    return chats;
  } catch (error) {
    console.error('Error fetching user chats:', error);
    throw error;
  }
}