import { GoogleGenerativeAI as gemini, Part } from "@google/generative-ai";

const geminiClient = new gemini(process.env.GEMINI_API_KEY as string);

const model = geminiClient.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
});

export const answerQuery = async (query: string) => {
    const response = await model.generateContent(query);
    return response.response.text();
}    

export const answerQueryWithImage = async(query: string, imagesBase64: string[], mimeTypes: string[]) => {
    try {
        const imagesBytes = imagesBase64.map(imageBase64 => Buffer.from(imageBase64, 'base64'));

        const imageParts: Part[] = imagesBytes.map((imageBytes, index) => {
            return {
                inlineData: {
                data: imageBytes.toString('base64'),
                mimeType: mimeTypes[index] as string
            }
            }
        });

        const result = await model.generateContent([query, ...imageParts]);
        const response = await result.response.text();
        return response;
    } catch (error) {
        console.error("Error in image analysis:", error);
        throw error;
    }
}

export default geminiClient;