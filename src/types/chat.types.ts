import z from "zod";

export enum QueryType {
    PLATFORM_INFO = "PLATFORM_INFO",
    USER_INFO = "USER_INFO",
    GENERAL = "GENERAL"
}

export const answerUserQuerySchema = z.object({
    query: z.string().nonempty('Query is required')
});

export type AnswerUserQueryRequest = z.infer<typeof answerUserQuerySchema>;

export interface ChatResponse {
    query: string;
    response: string;
    queryType: QueryType;
}

export type QueryTypeResult = QueryType;