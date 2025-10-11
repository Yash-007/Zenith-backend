import { Submission, SubmissionStatus, User } from "@prisma/client";
import { fetchOldSubmission, updateSubmissionStatus } from "../repo/submission";
import { getUserById, updateUserWithSpecificFields } from "../repo/user";
import { getChallengeById } from "../repo/challenge";
import * as cron from "node-cron";
import { SubmissionProofs } from "../types/submission.types";
import fs from "fs";
import { answerQueryWithImage } from "../clients/gemini";

const constructValidationPrompt = (submissionText: string, challengeDescription: string): string => {
    return `You are an encouraging validator for Zenith, a personal growth platform focused on helping users build positive habits and achieve personal growth. Your role is to validate submissions with a supportive mindset, understanding that users are making an effort to improve themselves.

${challengeDescription === "Custom submission" ? 
`This is a custom achievement submitted by a user.

Please evaluate with these guidelines:
1. Look for any signs of genuine effort or intention towards personal growth
2. Consider if the images provide any relevant context or support
3. Be lenient with the detail level - even basic reflection is acceptable
4. Remember this is a user-defined achievement, so be flexible in interpretation

The goal is to encourage users to continue sharing their growth journey.` 
:
`Challenge Description: "${challengeDescription}"

Please evaluate with these guidelines:
1. Look for reasonable attempt to meet the challenge spirit
2. Consider if the images show any relevant effort or context
3. Be lenient with partial completions - progress is valuable
4. Focus on encouraging continued participation
5. When in doubt, favor approving genuine attempts`}

User's Submission Text: "${submissionText}"

Remember:
- Our goal is to encourage consistent participation
- Perfect execution is not required
- Give benefit of doubt when possible
- Only reject if clearly unrelated or inappropriate

Provide your response in JSON format:
{
    "isValid": boolean,
    "reason": "For COMPLETED: A short congratulatory message (1-2 lines max). For REJECTED: A friendly explanation of what was missing and how to improve next time.",
    "suggestedStatus": "COMPLETED" or "REJECTED"
}

Response guidelines:
- For COMPLETED submissions, use messages like:
  "Great job on completing your challenge! Keep up the momentum!"
  "Well done! Your effort shows commitment to your growth journey."

- For REJECTED submissions, be constructive:
  "Please share what you actually did during the challenge - we'd love to hear about your experience!"
  "Next time, include a photo of your activity and tell us how it went."
  }`
};

export const updateUserSubmissionsJob = async () => {
    cron.schedule("15 * * * *", async() => {
        console.log("Updating user submissions......", new Date());
        await updateUserSubmissions();
    }, {
        timezone: "Asia/Kolkata"
    });
};


export const updateUserSubmissions = async () => {
    try {
            const oldSubmission = await fetchOldSubmission();
            console.log("Old submission:", oldSubmission);
            if (!oldSubmission) {
                console.log("No old submission found while running updateUserSubmissionsJob");
                return;
            }
            const user = await getUserById(oldSubmission.userId);
            if (!user) {
                console.log("User not found while running updateUserSubmissionsJob");
                return;
            }
            
            let challengeDescription = "";

            if (oldSubmission.isChallengeExists){
                const challenge = await getChallengeById(oldSubmission.challengeId)
                if (challenge){
                    challengeDescription = challenge.longDescription;
                } else {
                    console.log("Challenge not found while running updateUserSubmissionsJob");
                    return;
                }
            } else {
                challengeDescription = "Custom submission";
            }

            let userFields: Partial<User> = {
                challengesInReview: user.challengesInReview-1,
            };

            const proofs: SubmissionProofs = oldSubmission.proofs as SubmissionProofs;
            const text = proofs.text;
            const images = proofs.images;

            console.log("Text:", text);
            console.log("Images:", images);

            if (images.length === 0) {
                console.log("No images found in submission while running updateUserSubmissionsJob");
                return;
            }

            const base64Images = images.map(image => fs.readFileSync(image, {encoding: 'base64'}));
            const mimeTypes = images.map(image => image.endsWith('.png') ? 'image/png' : 
                           image.endsWith('.jpg') || image.endsWith('.jpeg') ? 'image/jpeg' : 
                           'application/octet-stream');

            const validationPrompt = constructValidationPrompt(text, challengeDescription);
            const rawResponse = await answerQueryWithImage(validationPrompt, base64Images, mimeTypes);
              const cleanResponse = rawResponse.replace(/```json\n|\n```/g, '');
              const validationResult = JSON.parse(cleanResponse);
            console.log("Validation result:", validationResult);

            const updatedSubmission = await updateSubmissionStatus(
                oldSubmission.id, 
                validationResult.suggestedStatus as SubmissionStatus,
                validationResult.reason as string
            );
            if (!updatedSubmission) {
                console.log("Failed to update submission status while running updateUserSubmissionsJob");
                return;
            }

            if (updatedSubmission.status === SubmissionStatus.COMPLETED){
                let challengePoints = 0;
                if (!updatedSubmission.isChallengeExists){
                    challengePoints = 100;
                } else {
                    const challenge = await getChallengeById(updatedSubmission.challengeId);
                    if (!challenge) {
                        console.log("Challenge not found while running updateUserSubmissionsJob");
                        return;
                    }
                    challengePoints = challenge.points;
                }
        
                userFields["challengesCompleted"] = user.challengesCompleted+1;
                userFields["totalPointsEarned"] = user.totalPointsEarned + challengePoints;
                userFields["currentPoints"] = user.currentPoints + challengePoints;            
            }

            const updatedUser = await updateUserWithSpecificFields(user.id, userFields);
            if (!updatedUser) {
                console.log("Failed to update user while running updateUserSubmissionsJob");
                return;
            }
            console.log("User submissions updated successfully while running updateUserSubmissionsJob");
    } catch (error) {
        console.error("Error updating user submissions while running updateUserSubmissionsJob", error);
        return;
    }
}
