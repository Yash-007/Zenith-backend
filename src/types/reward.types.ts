import z from "zod";

export const createUserRewardEntrySchema = z.object({
    pointsRewarded: z.number(),
    amount: z.number(),
    vpaAddress: z.string(),
    rewardType: z.string(),
});

export type CreateUserRewardEntryRequest = z.infer<typeof createUserRewardEntrySchema>