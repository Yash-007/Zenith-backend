import { GoogleGenerativeAI as gemini } from "@google/generative-ai";

const geminiClient = new gemini(process.env.GEMINI_API_KEY as string);

const model = geminiClient.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
});

export const answerQuery = async (query: string) => {
    const response = await model.generateContent(query);
    return response.response.text();
}    

export default geminiClient;