import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
    user: mongoose.Types.ObjectId;
    name: string;
    image: string;
    brand: string;
    category: mongoose.Types.ObjectId;
    description: string;
    price: number;
    countInStock: number;
    rating: number;
    numReviews: number;
    reviews: {
        user: mongoose.Types.ObjectId;
        name: string;
        rating: number;
        comment: string;
    }[];
}

const ProductSchema: Schema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category' }, // Link to Category model
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    reviews: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
            name: { type: String, required: true },
            rating: { type: Number, required: true },
            comment: { type: String, required: true }
        }
    ]
}, { timestamps: true });

const Product = mongoose.model<IProduct>('Product', ProductSchema);
export default Product;