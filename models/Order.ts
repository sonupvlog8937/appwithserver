import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
    name: string;
    qty: number;
    image: string;
    price: number;
    product: mongoose.Types.ObjectId;
}

export interface IShippingAddress {
    address: string;
    city: string;
    postalCode: string;
    country: string;
}

export interface IOrder extends Document {
    user: mongoose.Types.ObjectId;
    orderItems: IOrderItem[];
    shippingAddress: IShippingAddress;
    paymentMethod: string; // 'CashOnDelivery', 'Stripe', etc.
    paymentResult?: {
        id: string;
        status: string;
        update_time: string;
        email_address: string;
    };
    taxPrice: number;
    shippingPrice: number;
    totalPrice: number;
    isPaid: boolean;
    paidAt?: Date;
    isDelivered: boolean;
    deliveredAt?: Date;
}

const OrderItemSchema: Schema = new Schema({
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' }
});

const ShippingAddressSchema: Schema = new Schema({
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
});

const OrderSchema: Schema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    orderItems: [OrderItemSchema],
    shippingAddress: ShippingAddressSchema,
    paymentMethod: { type: String, required: true },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String }
    },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date }
}, { timestamps: true });

const Order = mongoose.model<IOrder>('Order', OrderSchema);
export default Order;