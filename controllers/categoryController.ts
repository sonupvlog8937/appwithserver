import { Request, Response } from 'express';
import Category from '../models/Category';

// @desc    Get all categories (and subcategories)
// @route   GET /api/categories
// @access  Public
const getCategories = async (req: Request, res: Response) => {
    // Fetch all categories and populate parentCategory for hierarchical view
    const categories = await Category.find({}).populate('parentCategory', 'name slug');
    res.json(categories);
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req: Request, res: Response) => {
    const { name, parentCategory } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''); // Generate slug

    const categoryExists = await Category.findOne({ slug });

    if (categoryExists) {
        res.status(400).json({ message: 'Category with this name/slug already exists' });
        return;
    }

    const category = new Category({
        name,
        slug,
        parentCategory: parentCategory || null, // If parentCategory is provided
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
};

// @desc    Get categories with their direct subcategories
// @route   GET /api/categories/tree
// @access  Public
const getCategoryTree = async (req: Request, res: Response) => {
    const categories = await Category.find({ parentCategory: null }); // Top-level categories
    const categoryTree: any[] = [];

    for (const cat of categories) {
        const subcategories = await Category.find({ parentCategory: cat._id });
        categoryTree.push({
            ...cat.toObject(),
            subcategories: subcategories.map(sub => sub.toObject())
        });
    }
    res.json(categoryTree);
};

export { getCategories, createCategory, getCategoryTree };
