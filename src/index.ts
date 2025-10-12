import { Express, Request, Response, NextFunction } from 'express';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import userRouter from './routes/user';
import challengeRouter from './routes/challenge';
import submissionRouter from './routes/submission';
import rewardRouter from './routes/reward';
import chatRouter from './routes/chat';
import redisClient from './clients/redis';
import { updateUsersCurrentStreakJob } from './jobs/updateUsersStreak';
import categoryRouter from './routes/category';
import cors from 'cors';
import geminiClient from './clients/gemini';
import { updateUserSubmissionsJob } from './jobs/updateUserSubmissions';
import transactionRouter from './routes/transaction';
const app: Express = express();


app.use("/uploads", express.static('uploads'))

// Middleware for JSON parsing
app.use(express.json());
app.use(cors({
  origin: "*"
}))

const port = process.env.PORT || 3000;

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Zenith Backend!' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});


app.use("/api/v1/user", userRouter);
app.use("/api/v1/challenge", challengeRouter);
app.use("/api/v1/submission", submissionRouter);
app.use("/api/v1/reward", rewardRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/transaction", transactionRouter);


updateUsersCurrentStreakJob();
updateUserSubmissionsJob();

// Start server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});