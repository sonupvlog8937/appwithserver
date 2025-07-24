import { Request, Response } from 'express';
import Order, { IOrder } from '../models/Order';
import Product from '../models/Product'; // To update stock
import { IUser } from '../models/User';

interface AuthenticatedRequest extends Request {
    user?: IUser; // Assuming IUser is imported from User model
}

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req: AuthenticatedRequest, res: Response) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    } else {
        const order = new Order({
            orderItems: orderItems.map((item: any) => ({
                ...item,
                product: item._id // Assuming _id from frontend is product ID
            })),
            user: req.user!._id,
            shippingAddress,
            paymentMethod,
            taxPrice,
            shippingPrice,
            totalPrice,
            isPaid: paymentMethod === 'CashOnDelivery' ? false : false, // COD orders are not "paid" initially
            paidAt: paymentMethod === 'CashOnDelivery' ? undefined : undefined, // Not paid until collected
            isDelivered: false,
        });

        const createdOrder = await order.save();

        // Optionally, decrease stock count for each product
        for (const item of orderItems) {
            const product = await Product.findById(item._id);
            if (product) {
                product.countInStock -= item.qty;
                await product.save();
            }
        }

        res.status(201).json(createdOrder);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req: AuthenticatedRequest, res: Response) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate('orderItems.product', 'name image price'); // Populate product details within order items

    if (order) {
        // Ensure the user viewing the order is either the order owner or an admin
        if (order.user.toString() === req.user!.id.toString() || req.user!.isAdmin) {
            res.json(order);
        } else {
            res.status(401).json({ message: 'Not authorized to view this order' });
        }
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isDelivered = true;
        order.deliveredAt = new Date();
        // If COD, mark as paid when delivered
        if (order.paymentMethod === 'CashOnDelivery') {
            order.isPaid = true;
            order.paidAt = new Date();
        }
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Get all orders (for admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req: Request, res: Response) => {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req: AuthenticatedRequest, res: Response) => {
    const orders = await Order.find({ user: req.user!._id }).populate('orderItems.product', 'name image');
    res.json(orders);
};

export { addOrderItems, getOrderById, updateOrderToDelivered, getOrders, getMyOrders };