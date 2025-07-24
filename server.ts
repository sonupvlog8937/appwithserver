import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import orderRoutes from './routes/orderRoutes';
// import userRoutes from './routes/userRoutes'; // You can add this for admin user management
import { notFound, errorHandler } from './middlewares/errorHandler';

dotenv.config(); // Load environment variables
connectDB(); // Connect to MongoDB

const app: Application = express();

app.use(express.json()); // Body parser for JSON

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
// app.use('/api/users', userRoutes); // Uncomment if you add user routes

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
