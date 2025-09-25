import z from "zod";

export const createUserRewardEntrySchema = z.object({
    pointsRewarded: z.number(),
    rewardType: z.string(),
    status: z.enum(["PENDING", "COMPLETED"]),
});

export type CreateUserRewardEntryRequest = z.infer<typeof createUserRewardEntrySchema>