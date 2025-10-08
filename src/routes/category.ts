import { Router } from "express";
import { createCategoryController, getAllCategories, getCategoriesByIds } from "../controllers/category";
import { authenticateToken } from "../middlewares/auth";

const categoryRouter = Router();

categoryRouter.get("/", getAllCategories);

categoryRouter.use(authenticateToken);
categoryRouter.post("/", createCategoryController);
categoryRouter.get("/ids", getCategoriesByIds);

export default categoryRouter;