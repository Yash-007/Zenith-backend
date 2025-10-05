import { writeFile } from 'fs/promises';
import path from 'path';

export const writeContextToFile = async (context: string, userId: string) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `user_context_${userId}_${timestamp}.txt`;
        const filePath = path.join(process.cwd(), 'temp', filename);
        
        await writeFile(filePath, context, 'utf8');
        console.log(`Context saved to ${filePath}`);
    } catch (error) {
        console.error('Error writing context to file:', error);
    }
};
