import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    slug: string; // For friendly URLs
    parentCategory?: mongoose.Types.ObjectId; // For subcategories
}

const CategorySchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null } // Self-referencing for subcategories
}, { timestamps: true });

const Category = mongoose.model<ICategory>('Category', CategorySchema);
export default Category;