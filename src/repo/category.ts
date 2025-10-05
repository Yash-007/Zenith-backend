import { Category, PrismaClient } from "@prisma/client";
import { CreateCategoryRequest } from "../types/category.types";

const prisma = new PrismaClient();

export const createCategory = async(createCategoryRequest: CreateCategoryRequest): Promise<Category | null> => {
    try {
        const category = await prisma.category.create({
            data: {
                ...createCategoryRequest
            }
        });
        return category;
    } catch (error) {
        console.error('Error creating category in db:', error);
        throw error;
    }
}

export const fetchAllCategories = async(): Promise<Category[] | null> => {
    try {
        const categories = await prisma.category.findMany();
        return categories as Category[];
    } catch (error) {
        console.error('Error fetching categories from db:', error);
        throw error;
    }
}

export const fetchCategoriesByIds = async(categoryIds: number[]): Promise<Category[]> => {
    try {
        const categories = await prisma.category.findMany({
            where: {
                id: {
                    in: categoryIds
                }
            }
        });
        return categories;
    } catch (error) {
        console.error('Error fetching categories by ids from db:', error);
        throw error;
    }
}