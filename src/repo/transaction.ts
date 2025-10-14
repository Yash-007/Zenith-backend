import { Contact, FundAccount, PrismaClient, Transaction } from "@prisma/client";
import { RazorpayContact, RazorpayFundAccount, RazorpayTransaction } from "../types/transaction.types";
import axios from "axios";
import { JsonObject, JsonValue } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

export const createContactInDb = async (createContactRequest: RazorpayContact): Promise<Contact> => {
    try {
        const contact = await prisma.contact.findUnique({
            where: {
                id: createContactRequest.id
            }
        });
        if (contact) {
            return contact;
        }
        const newContact = await prisma.contact.create({
            data: {
                id: createContactRequest.id,
                entity: createContactRequest.entity,
                name: createContactRequest.name,
                contact: createContactRequest.contact,
                email: createContactRequest.email,
                active: createContactRequest.active,
                createdAt: new Date(createContactRequest.created_at * 1000)
            }
        });

        return newContact;
    } catch (error) {
        console.error('Error creating contact:', error);
        throw error;
    }
}

export const fetchAllContacts = async(): Promise<Contact[]> => {
    try {
        const contacts = await prisma.contact.findMany({});
        return contacts;
    } catch (error) {
        console.error('Error fetching all contacts:', error);
        throw error;
    }
}

export const createFundAccountInDB = async(razorpayFundAccount: RazorpayFundAccount): Promise<FundAccount> => {
    try {
        const createdFundAccount = await prisma.fundAccount.create({
            data: {
                id: razorpayFundAccount.id,
                entity: razorpayFundAccount.entity,
                vpaAddress: razorpayFundAccount.vpa.address,
                vpa: razorpayFundAccount.vpa as JsonObject,
                contactId: razorpayFundAccount.contact_id,
                accountType: razorpayFundAccount.account_type,
                active: razorpayFundAccount.active,
                createdAt: new Date(razorpayFundAccount.created_at * 1000)
            }
        });

        return createdFundAccount;
    } catch (error) {
        console.error('Error finding or creating fund account:', error);
        throw error;
    }
}

export const fetchFundAccountByVpaAddress = async(vpaAddress: string): Promise<FundAccount | null> => {
    try {
        const fundAccount = await prisma.fundAccount.findUnique({
            where: {
                vpaAddress: vpaAddress
            }
        });
        return fundAccount as FundAccount;
    } catch (error) {
        console.error('Error fetching fund account by vpa address:', error);
        throw error;
    }
}

export const fetchFundAccountById = async(id: string): Promise<FundAccount | null> => {
    try {
        const fundAccount = await prisma.fundAccount.findUnique({
            where: {
                id: id
            }
        });
        return fundAccount as FundAccount;
    } catch (error) {
        console.error('Error fetching fund account by id:', error);
        throw error;
    }
}

export const findFundAccountByVpaAddressAndContactId = async(vpaAddress: string, contactId: string): Promise<FundAccount | null> => {
    try {
        const fundAccount = await prisma.fundAccount.findUnique({
            where: {
                vpaAddress_contactId: {
                    vpaAddress: vpaAddress,
                    contactId: contactId
                }
            }
        });

        return fundAccount;
    } catch (error) {
        console.error('Error finding fund account by vpa address:', error);
        throw error;
    }
}

export const createTransactionInDB = async(razorpayTransaction: RazorpayTransaction, idempotencyKey: string, userId: string, rewardId: string): Promise<Transaction | null> => {
    try {
        const createdTransaction = await prisma.transaction.create({
            data: {
                id: razorpayTransaction.id,
                userId: userId,
                rewardId: rewardId,
                merchantAccountNumber: process.env.RAZORPAY_MERCHANT_ACCOUNT_NUMBER as string,
                entity: razorpayTransaction.entity,
                idempotencyKey: idempotencyKey,
                fundAccountId: razorpayTransaction.fund_account_id,
                amount: razorpayTransaction.amount,
                currency: razorpayTransaction.currency,
                fees: razorpayTransaction.fees,
                tax: razorpayTransaction.tax,
                status: razorpayTransaction.status,
                utr: razorpayTransaction.utr || null,
                mode: razorpayTransaction.mode,
                purpose: razorpayTransaction.purpose,
                statusDetails: razorpayTransaction.status_details as JsonObject,
                statusDetailsId: razorpayTransaction.status_details_id || null,
                feeType: razorpayTransaction.fee_type || null,
                errorDetails: razorpayTransaction.error_details as JsonObject,
                failureReason: razorpayTransaction.failure_reason || null,
                merchantId: razorpayTransaction.merchant_id,
                createdAt: new Date(razorpayTransaction.created_at * 1000)
            }
        });
        return createdTransaction;
    } catch (error) {
        console.error('Error creating transaction in db:', error);
        throw error;
    }
}