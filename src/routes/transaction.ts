import { Router } from "express";
import { createContact, createTransaction, getAllContacts, getFundAccountByFundAccountId, getFundAccountByVpaAddress } from "../controllers/transaction";
import { authenticateToken } from "../middlewares/auth";

const transactionRouter = Router();

transactionRouter.use(authenticateToken);
transactionRouter.post('/contact', createContact);
transactionRouter.get('/contacts', getAllContacts);

transactionRouter.get('/fund-account/:vpaAddress', getFundAccountByVpaAddress);
transactionRouter.get('/fund-account/:fundAccountId', getFundAccountByFundAccountId);


export default transactionRouter;