import { Router } from "express";
import { createContact, createTransaction, getAllContacts, getAllFundAccounts, getAllTransactions, getFundAccountByFundAccountId, getFundAccountByVpaAddress, getTransactionByTransactionId, transactionWebhook } from "../controllers/transaction";
import { authenticateToken } from "../middlewares/auth";

const transactionRouter = Router();

transactionRouter.post("/update/webhook", transactionWebhook)

// transactionRouter.use(authenticateToken);
transactionRouter.post('/contact', createContact);
transactionRouter.get('/contacts', getAllContacts);

transactionRouter.get('/fund-account/:vpaAddress', getFundAccountByVpaAddress);
transactionRouter.get('/fund-account/:fundAccountId', getFundAccountByFundAccountId);
transactionRouter.get('/fund-accounts', getAllFundAccounts);

transactionRouter.get('/:transactionId', getTransactionByTransactionId);
transactionRouter.get('/', getAllTransactions);


export default transactionRouter;