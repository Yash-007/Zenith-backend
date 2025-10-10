import { fetchUserLastSubmission } from "../repo/submission";
import { fetchAllUsers, updateUserWithSpecificFields } from "../repo/user";
import { Submission, User } from "@prisma/client";
import * as cron from "node-cron";

// cron job at 00:01 AM every day
export const updateUsersCurrentStreakJob = async () => {
  cron.schedule("1 0 * * *", async() => {
    console.log("Updating users current streak......", new Date());
    await updateUsersCurrentStreak();
 }, {
  timezone: "Asia/Kolkata"
 })
}


export const updateUsersCurrentStreak = async () => {
  try { 
    const users = await fetchAllUsers();
    const userMap :{[key: string]: User} = {};
    const userLastSubmissionsPromises: Promise<Submission | null>[] = [];
    
    users.forEach((user)=> {
      userMap[user.id] = user;
      userLastSubmissionsPromises.push(fetchUserLastSubmission(user.id));
    });

    const userLastSubmissions = await Promise.all(userLastSubmissionsPromises);

    const updateUserPromises: Promise<User | null>[] = [];

    userLastSubmissions.forEach((submission)=> {
      if (!submission) return;
      if (!userMap[submission.userId]?.currentStreak) return;
      
      const date = new Date(Date.now());
      const currentDate = date.getDate();
      const currentMonth = date.getMonth();
      const currentYear = date.getFullYear();

      const endDate = new Date(currentYear, currentMonth, currentDate, 0, 0, 0);
      const startDate = new Date(currentYear, currentMonth, currentDate-1, 0, 0, 0);

      if (submission.submittedAt < startDate) {
        updateUserPromises.push(updateUserWithSpecificFields(submission.userId, {currentStreak: 0}));
      }
      // else if (submission.submittedAt >= endDate) {
      //   updateUserPromises.push(updateUserWithSpecificFields(submission.userId, {currentStreak: 1}));
      // }
    });

    if (updateUserPromises.length > 0) {
      await Promise.all(updateUserPromises);
    console.log("Users current streak updated successfully");
    } else {
      console.log("No users current streak updated");
    }
  } catch (error) {
    console.error('Error updating users current streak:', error);
  }
}