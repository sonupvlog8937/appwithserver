import express from 'express';
import { addOrderItems, getOrderById, updateOrderToDelivered, getOrders, getMyOrders } from '../controllers/orderController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);

export default router;
