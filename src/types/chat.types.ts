import z from "zod";


export const answerUserQuerySchema = z.object({
    query: z.string().nonempty('Query is required')
});

export type AnswerUserQueryRequest = z.infer<typeof answerUserQuerySchema>;