import { PrismaClient, User } from "@prisma/client";
import { CreateUserRequest } from "../types/user.types";
import { string } from "zod";
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

export const updateUserWithSpecificFields = async(userId: string, userFields: {[key:string]: any}): Promise<User | null> => {
    try {
        const data: {[key:string]: any} = {};
        Object.keys(userFields).forEach((key)=> {
            data[key] = userFields[key];
        })
        
           const updatedUser = await prisma.user.update({
            where: {
                id : userId
            },
            data: data
           });
           return updatedUser as User;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export const fetchLeaderboard = async(page: number, limit: number, lowerAge: number, upperAge: number, city: string): Promise<User[]> => {
    try {
        const filters: {[key:string]: any} = {};
        limit = limit || 10;
        lowerAge = lowerAge || 0;
        upperAge = upperAge || 100;
        const skip = (page - 1)* limit;

        if (lowerAge) {
            filters["age"] = {
                "gte": lowerAge
            }
        }
        if (upperAge) {
            filters["age"] = {
                "lte": upperAge
            }
        }
        if (city) {
            filters["city"] = city.toUpperCase();
        }

        const users = await prisma.user.findMany({
            orderBy: [
                {currentPoints: "desc"},
                {longestStreak: "desc"},
                {id: "asc"}
            ],
            where: filters,
            skip: skip,
            take: limit,
        });

        return users as User[];
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
    }
}

export const fetchUserRankLeaderboard = async(user: User, limit: number): Promise<User[] | null> => {
    try {
        const userRankQuery = await prisma.user.aggregate({
            _count: {
                _all: true
            },
            orderBy: [
                {currentPoints: "desc"},
                {longestStreak: "desc"},
                {id: "asc"}
            ],
            where: {
                OR: [
                    {
                        currentPoints: {gt: user.currentPoints}
                    },
                    {
                        AND: [
                            {
                                currentPoints: {equals: user.currentPoints},
                                OR: [
                                    {
                                    longestStreak: {gt: user.longestStreak},
                                    },
                                    {
                                        AND: [
                                            {
                                                longestStreak: {equals: user.longestStreak},
                                                
                                            },
                                            {
                                                id: {lte: user.id},
                                            }
                                        ]
                                    }
                            ]
                                
                            }
                        ]
                    }
                ]
            }
        });

        const userRank = userRankQuery._count._all;

        const page = Math.ceil(userRank/limit);
        let skip = Math.max(0, (page - 1)* limit);
        let userLimit = userRank % limit === 0 ? limit : userRank % limit;

        let users = await prisma.user.findMany({
            orderBy: [
                {currentPoints: "desc"},
                {longestStreak: "desc"},
                {id: "asc"}
            ],
            skip: skip,
            take: userLimit,
            where: {
                OR: [
                    {
                        currentPoints: {gt: user.currentPoints}
                    },
                    {
                        AND: [
                            {
                                currentPoints: {equals: user.currentPoints},
                                OR: [
                                    {
                                    longestStreak: {gt: user.longestStreak},
                                    },
                                    {
                                        AND: [
                                            {
                                                longestStreak: {equals: user.longestStreak},
                                                
                                            },
                                            {
                                                id: {lte: user.id},
                                            }
                                        ]
                                    }
                            ]
                                
                            }
                        ]
                    }
                ]
            },
        });

        const remainingUsersLimit = limit - userLimit;
        if (!remainingUsersLimit) {
            return users as User[];
        }

        let remainingUsers = await prisma.user.findMany({
            orderBy: [
                {currentPoints: "desc"},
                {longestStreak: "desc"},
                {id: "asc"}
            ],
            take: remainingUsersLimit,
            where: {
                OR: [
                    { currentPoints: { lt: user.currentPoints } },
                    {
                        AND: [
                            { currentPoints: { equals: user.currentPoints },
                              OR: [
                                  { longestStreak: { lt: user.longestStreak } },
                                  {
                                      AND: [
                                          { longestStreak: { equals: user.longestStreak } },
                                          { id: { gt: user.id } }
                                      ]
                                  }
                              ]
                            }
                        ]
                    }
                ]
            }
        });

        const finalUsers = [...users as User[], ...remainingUsers as User[]];
        return finalUsers;

    } catch (error) {
        console.error('Error fetching user rank leaderboard:', error);
        throw error;
    }
}

export const fetchAllUsers = async(): Promise<User[]> => {
    try {
        const users = await prisma.user.findMany();
        return users as User[];
    } catch (error) {
        console.error('Error fetching all users:', error);
        throw error;
    }
}