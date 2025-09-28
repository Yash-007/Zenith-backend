import z from "zod";


export const createCategorySchema = z.object({
    name: z.string().min(4, "Name must be at least 4 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
});

export const getCategoriesByIdsQuerySchema = z.object({
    categoryId: z.union(
        [
            z.string(),
            z.array(z.string())
        ]
    ).transform(val => (Array.isArray(val) ? val.map(id => parseInt(id)) : [parseInt(val)]))
});

export type CreateCategoryRequest = z.infer<typeof createCategorySchema>;
export type GetCategoriesByIdsQueryType = z.infer<typeof getCategoriesByIdsQuerySchema>;