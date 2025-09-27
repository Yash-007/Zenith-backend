import { GoogleGenerativeAI as gemini } from "@google/generative-ai";

const geminiClient = new gemini('AIzaSyBgzc_W3iXkcJZ2glvkZFG37uQYFMSPM8c');

const model = geminiClient.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
});

export const answerQuery = async (query: string) => {
    const response = await model.generateContent(query);
    return response.response.text();
}    
