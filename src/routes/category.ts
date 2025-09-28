import { Router } from "express";
import { createCategoryController, getAllCategories, getCategoriesByIds } from "../controllers/category";
import { authenticateToken } from "../middlewares/auth";

const categoryRouter = Router();

categoryRouter.use(authenticateToken);

categoryRouter.post("/", createCategoryController);
categoryRouter.get("/", getAllCategories);
categoryRouter.get("/ids", getCategoriesByIds);

export default categoryRouter;