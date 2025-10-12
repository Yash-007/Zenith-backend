import z from "zod";


export const createContactSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    contact: z.string(),
});

export type CreateContactRequest = z.infer<typeof createContactSchema>;

export type RazorpayContact = {
    id: string;
    entity: string;
    name: string
    email: string;
    contact: string;
    type: string;
    reference_id: string;
    active: boolean;
    created_at: number;
}