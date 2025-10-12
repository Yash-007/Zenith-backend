import { Router } from "express";
import { createContact } from "../controllers/transaction";

const transactionRouter = Router();

transactionRouter.post('/contact', createContact);

export default transactionRouter;