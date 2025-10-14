import { Request, Response } from "express";
import { AccountType, CreateContactRequest, createContactSchema, CreateTransactionRequest, RazorpayCreateFundAccountRequest, RazorpayCreateTransactionRequest, RazorpayTransaction, TransactionPurpose } from "../types/transaction.types";
import { ErrorResponse, SuccessResponse } from "../types/common.types";
import axios from "axios";
import { createContactInDb, createFundAccountInDB, createTransactionInDB, fetchAllContacts, fetchAllFundAccounts, fetchFundAccountById, fetchFundAccountByVpaAddress, fetchTransactionByTransactionId, findFundAccountByVpaAddressAndContactId } from "../repo/transaction";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import crypto from 'crypto';

export const createContact = async (req: Request<{}, {}, CreateContactRequest>, res: Response) => {
    try {
        const result = createContactSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: result.error.issues[0]?.message || 'Invalid request body',
                success: false
            } as ErrorResponse);
        }

        const validatedData = result.data;

       const response = await axios.post(`${process.env.RAZORPAY_API_URL}/contacts`, validatedData, {
            auth: {
                username: process.env.RAZORPAY_API_KEY as string,
                password: process.env.RAZORPAY_API_SECRET as string
            }
        });
        console.log(response.data);
        if (response.status === 200) {
        const contact = await createContactInDb(response.data);
        if (!contact) {
            throw new Error('Failed to create contact in db');
        }
        return res.status(201).json({
            message: 'Contact created successfully',
            success: true,
            data: contact
        } as SuccessResponse);
     } else {
            console.error('Error creating contact:', response.data);
            throw new Error('Failed to create contact in razorpay');
        }
    } catch (error: any) {
        console.error('Error creating contact:', error?.response?.data?.error || error?.message || error);
        res.status(500).json({
            message: 'Failed to create contact',
            success: false
        } as ErrorResponse);
    }
}

export const getAllContacts = async (req: Request, res: Response<ErrorResponse | SuccessResponse>) => {
    try {
        const contacts = await fetchAllContacts();
        return res.status(200).json({
            success: true,
            message: 'Contacts fetched successfully',
            data: contacts
        } as SuccessResponse);
    } catch (error) {
        console.error('Error fetching all contacts:', error);
        return res.status(500).json({
            message: 'Failed to fetch contacts',
            success: false
        } as ErrorResponse);
    }
}

export const createFundAccount = async (req: Request, res: Response<ErrorResponse | SuccessResponse>) => {
    try {
        
    } catch (error) {
        console.error('Error creating fund account:', error);
        return res.status(500).json({
            message: 'Failed to create fund account',
            success: false
        } as ErrorResponse);
    }
}

export const getFundAccountByVpaAddress = async (req: Request<{vpaAddress: string}>, res: Response<ErrorResponse | SuccessResponse>) => {
  try {
    const vpaAddress = req.params.vpaAddress;
    const fundAccount = await fetchFundAccountByVpaAddress(vpaAddress);
    if (!fundAccount) {
      return res.status(404).json({
        message: 'Fund account not found',
        success: false
      } as ErrorResponse);
    }

    return res.status(200).json({
      message: 'Fund account fetched successfully',
      success: true,
      data: fundAccount
    } as SuccessResponse);
  } catch (error) {
    console.error('Error getting fund account by vpa address:', error);
    return res.status(500).json({
      message: 'Failed to get fund account by vpa address',
      success: false
    } as ErrorResponse);
  }
}

export const getFundAccountByFundAccountId = async (req: Request<{fundAccountId: string}>, res: Response<ErrorResponse | SuccessResponse>) => {
  try {
    const fundAccountId = req.params.fundAccountId;
    const fundAccount = await fetchFundAccountById(fundAccountId);
    if (!fundAccount) {
      return res.status(404).json({
        message: 'Fund account not found',
        success: false
      } as ErrorResponse);
    }

    return res.status(200).json({
      message: 'Fund account fetched successfully',
      success: true,
      data: fundAccount
    } as SuccessResponse);
  } catch (error) {
    console.error('Error getting fund account by contact id:', error);
    return res.status(500).json({
      message: 'Failed to get fund account by contact id',
      success: false
    } as ErrorResponse);
  }
}

export const getAllFundAccounts = async (req: Request, res: Response<ErrorResponse | SuccessResponse>) => {
  try {
    const fundAccounts = await fetchAllFundAccounts();
    return res.status(200).json({
      message: 'Fund accounts fetched successfully',
      success: true,
      data: fundAccounts
    } as SuccessResponse);
  } catch (error) {
    console.error('Error getting all fund accounts:', error);
    return res.status(500).json({
      message: 'Failed to get all fund accounts',
      success: false
    } as ErrorResponse);
  }
}

export const createTransaction =  async (createTransactionRequest: CreateTransactionRequest, userId: string) => {
    try {
        const contactId = 'cont_RSXMaBDgStGV9M';
        let fundAccount = await findFundAccountByVpaAddressAndContactId(createTransactionRequest.vpaAddress, contactId);
        
        if (!fundAccount) {
            const fundAccountRequest : RazorpayCreateFundAccountRequest = {
                contact_id: contactId,
                account_type: AccountType.VPA,
                vpa: {
                    address: createTransactionRequest.vpaAddress
                }
            }
            const fundAccountResponse = await axios.post(`${process.env.RAZORPAY_API_URL}/fund_accounts`, fundAccountRequest, {
                auth: {
                    username: process.env.RAZORPAY_API_KEY as string,
                    password: process.env.RAZORPAY_API_SECRET as string
                }
            });

            if (fundAccountResponse.status === 200) {
                const createdFundAccount = await createFundAccountInDB(fundAccountResponse.data);
                fundAccount = createdFundAccount;
            } else {
                console.error('Error creating fund account:', fundAccountResponse.data);
                throw new Error('Failed to create fund account');
            }
        }

        const transactionRequest : RazorpayCreateTransactionRequest = {
            account_number: process.env.RAZORPAY_MERCHANT_ACCOUNT_NUMBER as string,
            fund_account_id: fundAccount.id,
            amount: createTransactionRequest.amount,
            currency: 'INR',
            mode: 'UPI',
            purpose: TransactionPurpose.PAYOUT,
            queue_if_low_balance: false
        }
        const idempotencyKey = crypto.randomUUID();

        const transactionResponse = await axios.post(`${process.env.RAZORPAY_API_URL}/payouts`, transactionRequest, {
            auth: {
                username: process.env.RAZORPAY_API_KEY as string,
                password: process.env.RAZORPAY_API_SECRET as string
            },
            headers: {
                'X-Payout-Idempotency-Key': idempotencyKey
            }
        });

        if (transactionResponse.status === 200) {
            const razorpayTransaction: RazorpayTransaction = transactionResponse.data;
            const createdTransaction = await createTransactionInDB(razorpayTransaction, idempotencyKey, userId, createTransactionRequest.rewardId);
            if (createdTransaction) {
                return createdTransaction;
            } else {
                console.log(transactionResponse.data)
                throw new Error('Failed to create transaction in db');
            }
        } else {
            console.error('Error creating transaction:', transactionResponse.data);
            throw new Error('Failed to create transaction');
        }
    } catch (error: any) {
        console.error('Error creating transaction:', error?.response?.data?.error || error?.message || error);
        throw error;
    }
}

export const getTransactionByTransactionId = async (req: Request<{transactionId: string}>, res: Response<ErrorResponse | SuccessResponse>) => {
    try {
        const transactionId = req.params.transactionId;
        const transaction = await fetchTransactionByTransactionId(transactionId);
        if (!transaction) {
            return res.status(404).json({
                message: 'Transaction not found',
                success: false
            } as ErrorResponse);
        }
        return res.status(200).json({
            message: 'Transaction fetched successfully',
            success: true,
            data: transaction
        } as SuccessResponse);
    } catch (error) {
        console.error('Error getting transaction by transaction id:', error);
        return res.status(500).json({
            message: 'Failed to get transaction by transaction id',
            success: false
        } as ErrorResponse);
    }
}