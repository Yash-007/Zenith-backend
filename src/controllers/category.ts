import { Request, Response } from "express";
import { CreateCategoryRequest, createCategorySchema, getCategoriesByIdsQuerySchema, GetCategoriesByIdsQueryType } from "../types/category.types";
import { ErrorResponse, SuccessResponse } from "../types/common.types";
import { createCategory, fetchAllCategories, fetchCategoriesByIds } from "../repo/category";

export const createCategoryController = async(req:Request<{}, {}, CreateCategoryRequest>, res:Response) => {
    try {
        const result = createCategorySchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: result.error.issues[0]?.message || 'Invalid request body',
                success: false
            } as ErrorResponse);
        }
        const validatedData = result.data;
        const category = await createCategory(validatedData);
        if (!category) {
            return res.status(500).json({
                message: 'Failed to create category',
                success: false
            } as ErrorResponse);
        }
        return res.status(201).json({
            message: 'Category created successfully',
            success: true,
            data: category
        } as SuccessResponse);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            message: 'Failed to create category',
            success: false
        } as ErrorResponse);
    }
}

export const getAllCategories = async(req: Request, res: Response<ErrorResponse | SuccessResponse>) => {
    try {
        const categories = await fetchAllCategories();
        return res.status(200).json({
            success: true,
            message: 'Categories fetched successfully',
            data: categories
        } as SuccessResponse);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            message: 'Failed to fetch categories',
            success: false
        } as ErrorResponse);
    }
}

export const getCategoriesByIds = async(req: Request<{}, {}, {}, GetCategoriesByIdsQueryType>, res: Response<ErrorResponse | SuccessResponse>) => {
    try {
        const result = getCategoriesByIdsQuerySchema.safeParse(req.query);
        if (!result.success) {
            return res.status(400).json({
                message: result.error.issues[0]?.message || 'Invalid query params',
                success: false
            } as ErrorResponse);
        }
        let categoryIds = result.data.categoryId;
        
        const categories = await fetchCategoriesByIds(categoryIds);
        return res.status(200).json({
            success: true,
            message: 'Categories fetched successfully',
            data: categories
        } as SuccessResponse);
    } catch (error) {
        console.error('Error fetching categories by ids:', error);
        res.status(500).json({
            message: 'Failed to fetch categories by ids',
            success: false
        } as ErrorResponse);
    }
}