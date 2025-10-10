import { QueryType, QueryTypeResult } from "../types/chat.types";
import { answerQuery } from "../clients/gemini";
import { User } from "@prisma/client";

export const QUERY_CLASSIFIER_PROMPT = `You are an AI assistant for Zenith, a personal growth platform. Your role is to categorize user queries into three categories to determine the context needed for answers.

Platform Context:
- Daily challenges (Physical, Mental, Social categories)
- Points: 80-100 per challenge, 100 for custom submissions
- Rewards: 3000 points = ₹200
- Progress tracking: streaks, levels, heatmap
- Community: city/age leaderboards
- Challenge process: text + photos submission, review system
- Difficulty levels: Beginner, Intermediate, Advanced

Categories:

1. PLATFORM_INFO
   Platform features and processes questions
   Examples:
   - "How do points work?"
   - "What types of challenges exist?"
   - "How does reward system work?"
   - "What happens after submission?"

2. USER_INFO
   Personal progress and data questions
   Examples:
   - "How am I performing?"
   - "What's my streak?"
   - "How many points do I have?"
   - "What's my ranking?"

3. GENERAL
   Growth and motivation questions
   Examples:
   - "How to stay motivated?"
   - "Tips for building habits?"
   - "Ways to be consistent?"
   - "Best growth practices?"

IRRELEVANT (Reject):
- Technical issues
- Unrelated questions
- Inappropriate content
- Random chat

Response Format:
  "CATEGORY_NAME"  // Must be one of: PLATFORM_INFO, USER_INFO, GENERAL

Classification Rules:
1. Check if platform-specific info needed
2. Check if user data required
3. Ensure query relates to growth/platform

Respond with just the category name.`;

export const PLATFORM_INFO_PROMPT = `You are providing information about Zenith, a personal growth and self-improvement platform. Here is the comprehensive platform context to use when answering PLATFORM_INFO queries:

Challenge System:
1. Categories
   - Physical Wellness: Exercise, nutrition, sleep habits
   - Mental Fitness: Meditation, learning, problem-solving
   - Social Impact: Community service, helping others
   - Skill Development: Learning new skills, practicing existing ones
   - Financial Wellness: Budgeting, saving, financial literacy
   - Personal Growth: Self-reflection, goal-setting
   - Others: Miscellaneous growth activities

2. Challenge Types
   - Predefined Challenges: Curated by platform
   - Custom Challenges: User-created daily achievements
   - Difficulty Levels: Beginner (0), Intermediate (1), Advanced (2)

3. Submission Process
   - Text description of completion
   - Photo evidence (up to 5 images)
   - Review system for verification
   - Status: PENDING, COMPLETED, REJECTED

4. Points System
   - Regular challenges: 80-100 points
   - Custom submissions: 100 points
   - Streak bonuses: Additional points for consistency
   - Minimum 4 interests required at signup

5. Rewards
   - 3000 points = ₹200
   - Points can only be redeemed in multiples of 3000
   - Instant redemption process
   - Digital payment transfer

6. Progress Tracking
   - Daily streaks tracking
   - Activity heatmap (365-day view)
   - Level progression system
   - Challenge completion statistics
   - Submission history

7. Community Features
   - Global leaderboard
   - City-wise rankings
   - Age-based filtering
   - Profile customization
   - Member since tracking

8. User Levels
   - Based on points and consistency
   - Affects challenge access
   - Special rewards at milestones
   - Visible on profile and leaderboard

Use this context to provide accurate, detailed responses about how the platform works, its features, and processes. Always maintain an encouraging, growth-oriented tone that emphasizes personal development and consistent effort.

Answer the user's question about the platform.`;

import { fetchAllCategories } from "../repo/category";
import { fetchAllSubmissionsWithPagination } from "../repo/submission";
import { getChallengeById } from "../repo/challenge";
import { Category, Submission } from "@prisma/client";

interface CategorySubmissionCount {
    [categoryId: number]: number;
}

interface StatusSubmissionCount {
    PENDING: number;
    COMPLETED: number;
    REJECTED: number;
}

export const getUserContextString = async (user: User): Promise<string> => {
    // Fetch all categories
    const categories = await fetchAllCategories() as Category[];
    const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));

    // Fetch user submissions (all of them)
    const submissionsData = await fetchAllSubmissionsWithPagination(user.id, 0, 0);
    const submissions = submissionsData.submissions;

    // Categorize submissions by category
    const categorySubmissionCount: CategorySubmissionCount = {};
    categories.forEach(cat => categorySubmissionCount[cat.id] = 0);
    categorySubmissionCount[0] = 0; // for custom submissions

    // Categorize submissions by status
    const statusCount: StatusSubmissionCount = {
        PENDING: 0,
        COMPLETED: 0,
        REJECTED: 0
    };

    // Process submissions
    interface SubmissionWithDescription extends Submission {
        challengeDescription?: string | null;
    }
    
    const recentSubmissions: SubmissionWithDescription[] = [];
    for (const submission of submissions) {
        // Count by status
        statusCount[submission.status]++;

        // Get challenge details if exists
        let challengeDescription: string | null = null;
        if (submission.isChallengeExists) {
            const challenge = await getChallengeById(submission.challengeId);
            if (challenge) {
                // Update category count
                categorySubmissionCount[challenge.category] = 
                    (categorySubmissionCount[challenge.category] || 0) + 1;
                
                // Store challenge description
                challengeDescription = challenge.description;
            }
        } else {
            challengeDescription = "Custom submission";
            categorySubmissionCount[0] = (categorySubmissionCount[0] || 0) + 1;
        }

        // Collect recent submissions (up to 30) with challenge description
        if (recentSubmissions.length < 30) {
            recentSubmissions.push({
                ...submission,
                challengeDescription
            });
        }
    }

    // Build the context string
    // Calculate platform vs custom challenges
    const platformChallenges = submissions.filter(s => s.isChallengeExists).length;
    const customChallenges = submissions.filter(s => !s.isChallengeExists).length;

    let context = `
User Overview:
- Points: ${user.currentPoints} (Total earned: ${user.totalPointsEarned}, Used: ${user.pointsUsed})
- Streak: Current ${user.currentStreak} days (Longest: ${user.longestStreak} days)
- Level: ${user.level}
- Overall Progress: ${user.challengesCompleted} completed, ${user.challengesInReview} in review
- Total Submitted: ${user.challengesSubmitted}

Challenge Types:
- Platform Challenges: ${platformChallenges} (Pre-defined challenges from our curated collection)
- Custom Challenges: ${customChallenges} (Personal achievements submitted by you)

Submission Status:
- Pending Review: ${statusCount.PENDING}
- Completed: ${statusCount.COMPLETED}
- Rejected: ${statusCount.REJECTED}

Category Progress:`;

    // Add category-wise progress
    for (const [catId, count] of Object.entries(categorySubmissionCount)) {
        if (count > 0) {
            const categoryName = Number(catId) === 0 ? "Custom Challenges" : categoryMap.get(Number(catId));
            context += `\n- ${categoryName}: ${count} submissions`;
        }
    }

    // Add recent submissions if available
    if (recentSubmissions.length > 0) {
        context += `\n\nRecent Submissions (up to 30):`;
        for (const sub of recentSubmissions) {
            context += `\n- ${sub.challengeName} (${sub.status})`;
            if (sub.challengeDescription) {
                context += `\n  Description: ${sub.challengeDescription}`;
            }
        }
    }

    return context;
};

export const GENERAL_PROMPT = `You are an AI coach for Zenith, a personal growth platform. Provide practical advice that encourages consistent engagement with the platform's features.

Guidelines:
- Focus on actionable, realistic steps
- Connect advice to platform features (challenges, streaks, points)
- Keep responses encouraging and supportive
- Emphasize small, daily actions
- Maintain under 150 words
- Use simple, clear language

Response Structure:
1. Brief acknowledgment
2. 2-3 practical tips
3. How to use platform features
4. Short encouragement

DO:
- Suggest specific daily actions
- Link advice to platform challenges
- Promote consistent habits
- Acknowledge gradual progress

DON'T:
- Give medical/professional advice
- Make unrealistic promises
- Use generic motivational quotes
- Suggest extreme changes

Example:
User: "How can I stay motivated?"

"Building motivation starts with small wins. Choose one challenge that excites you and commit to it for just a week. Use our streak system to track your progress - even a 3-day streak can boost your confidence!

Tips:
• Start with beginner-level challenges
• Track daily completions
• Celebrate each small win

Remember, consistency beats intensity. Focus on showing up daily, and let your streak grow naturally."

Answer the user's question following these guidelines.`;

export const determineQueryType = async (query: string): Promise<QueryTypeResult> => {
    const response = await answerQuery(QUERY_CLASSIFIER_PROMPT + "\nQuery: " + query);
    return response.trim() as QueryTypeResult;
};

export const getPromptForQueryType = (type: QueryType, userContext?: string): string => {
    switch(type) {
        case QueryType.PLATFORM_INFO:
            return PLATFORM_INFO_PROMPT;
        case QueryType.USER_INFO:
            return `You are an AI assistant for Zenith platform.
Here's the user's context:
${userContext}
Answer their question based on their data and provide encouraging feedback on their progress.`;
        case QueryType.GENERAL:
            return GENERAL_PROMPT;
        case QueryType.IRRELEVANT:
            return "";
    }
};
