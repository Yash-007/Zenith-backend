import { Contact, PrismaClient } from "@prisma/client";
import { RazorpayContact } from "../types/transaction.types";

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