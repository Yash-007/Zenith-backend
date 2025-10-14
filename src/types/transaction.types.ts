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

export type CreateTransactionRequest = {
    vpaAddress: string;
    amount: number;
    rewardId: string;
}

export enum AccountType {
    VPA = "vpa",
}
export type RazorpayCreateFundAccountRequest = {
    contact_id: string;
    account_type: AccountType;
    vpa: {
        address: string;
    }
}

export type RazorpayFundAccount = {
    id: string;
    entity: string;
    contact_id: string;
    account_type: AccountType;
    vpa: {
        username: string;
        handle: string;
        address: string;
    }
    active: boolean;
    created_at: number;
}

export enum TransactionPurpose {
    REFUND = "refund",
    CASBHACK = "cashback",
    PAYOUT = "payout",
    SALARY = "salary",
    UTILITY_BILL = "utility bill",
    VENDOR_BILL = "vendor bill",
}

export type RazorpayCreateTransactionRequest = {
    account_number: string;
    fund_account_id: string;
    amount: number;
    currency: string;
    mode: string;
    purpose: TransactionPurpose;
    queue_if_low_balance: boolean;
}

export type RazorpayTransaction = {
    id: string;
    entity: string;
    fund_account_id: string;
    amount: number;
    currency: string;
    fees: number;
    tax: number;
    status: string;
    purpose: TransactionPurpose;
    utr?: string;
    mode: string;
    failure_reason?: string;
    created_at: number;
    fee_type?: string;
    status_details?: {
        resason?: string;
        description?: string;
        source?: string;
    };
    merchant_id: string;
    status_details_id?: string;
    error_details?: {
        source?: string;
        reason?: string;
        description?: string;
        code?: string;
        step?: string[];
        metadata?: any;
    }
}