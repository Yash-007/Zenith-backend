import { Router } from "express";
import { createContact, getAllContacts } from "../controllers/transaction";

const transactionRouter = Router();

transactionRouter.post('/contact', createContact);
transactionRouter.get('/contacts', getAllContacts);

export default transactionRouter;