import { Request, Response } from "express";
import { CreateContactRequest, createContactSchema } from "../types/transaction.types";
import { ErrorResponse, SuccessResponse } from "../types/common.types";
import axios from "axios";
import { createContactInDb, fetchAllContacts } from "../repo/transaction";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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

        const contact = await createContactInDb(response.data);

        return res.status(201).json({
            message: 'Contact created successfully',
            success: true,
            data: contact
        } as SuccessResponse);
    } catch (error) {
        console.error('Error creating contact:', error);
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