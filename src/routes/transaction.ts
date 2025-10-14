import { Router } from "express";
import { createContact, createTransaction, getAllContacts } from "../controllers/transaction";
import { authenticateToken } from "../middlewares/auth";

const transactionRouter = Router();

transactionRouter.use(authenticateToken);
transactionRouter.post('/contact', createContact);
transactionRouter.get('/contacts', getAllContacts);


export default transactionRouter;