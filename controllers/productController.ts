import { Request, Response } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req: Request, res: Response) => {
    const pageSize = 10; // Number of products per page
    const page = Number(req.query.pageNumber) || 1;
    const keyword = req.query.keyword ? {
        name: {
            $regex: req.query.keyword,
            $options: 'i' // Case-insensitive search
        }
    } : {};

    let categoryFilter: any = {};
    if (req.query.category) {
        const category = await Category.findOne({ slug: req.query.category });
        if (category) {
            // Find all subcategories recursively if needed, or just use the direct category
            // For simplicity, we'll just use the direct category for now
            categoryFilter = { category: category._id };
        } else {
            return res.status(404).json({ message: 'Category not found' });
        }
    }

    const count = await Product.countDocuments({ ...keyword, ...categoryFilter });
    const products = await Product.find({ ...keyword, ...categoryFilter })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .populate('category', 'name slug'); // Populate category name and slug

    res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req: Request, res: Response) => {
    // Example: For actual image upload, integrate with Multer and Cloudinary
    // For now, assume image URL is provided in req.body or use a placeholder
    const { name, price, description, brand, category, countInStock, image } = req.body;
    const categoryDoc = await Category.findById(category);

    if (!categoryDoc) {
        return res.status(400).json({ message: 'Category not found' });
    }

    const product = new Product({
        user: (req as any).user._id, // Assuming user is attached by auth middleware
        name,
        price,
        description,
        image: image || 'https://placehold.co/600x400/FF0000/FFFFFF?text=No+Image', // Placeholder image
        brand,
        category: categoryDoc._id,
        countInStock,
        numReviews: 0,
        rating: 0,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req: Request, res: Response) => {
    const { name, price, description, brand, category, countInStock, image } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;
        product.brand = brand || product.brand;
        product.image = image || product.image;
        product.countInStock = countInStock || product.countInStock;

        if (category) {
            const categoryDoc = await Category.findById(category);
            if (categoryDoc) {
                product.category = categoryDoc.id;
            } else {
                return res.status(400).json({ message: 'Category not found' });
            }
        }

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne(); // Use deleteOne()
        res.json({ message: 'Product removed' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

export { getProducts, getProductById, createProduct, updateProduct, deleteProduct };