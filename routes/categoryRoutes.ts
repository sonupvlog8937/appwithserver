import express from 'express';
import { getCategories, createCategory, getCategoryTree } from '../controllers/categoryController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/').get(getCategories).post(protect, admin, createCategory);
router.route('/tree').get(getCategoryTree); // For fetching categories in a tree structure
// Add routes for updating and deleting categories (protect, admin)
export default router;
