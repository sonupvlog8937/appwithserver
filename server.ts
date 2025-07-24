import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import orderRoutes from './routes/orderRoutes';
import cors from 'cors';
// import userRoutes from './routes/userRoutes'; // You can add this for admin user management
import { notFound, errorHandler } from './middlewares/errorHandler';

dotenv.config(); // Load environment variables
connectDB(); // Connect to MongoDB

const app: Application = express();

const corsOptions = {
    origin: [
        'http://localhost:3000', // Your React dashboard development server
        'http://localhost:19006', // Your React Native Expo web development server (if you use web)
        'https://your-deployed-dashboard-url.com', // Replace with your actual deployed dashboard URL
        'https://your-deployed-client-url.com' // Replace with your actual deployed React Native web client URL
        // You might also need to add your Render frontend URL if it's different
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies to be sent
    optionsSuccessStatus: 204 // Some legacy browsers (IE11, various SmartTVs) choke on 200
};

app.use(cors(corsOptions)); // Use CORS middleware with your options
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
