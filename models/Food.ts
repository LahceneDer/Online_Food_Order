import mongoose, { Schema, Document, Model } from "mongoose"

interface FoodDoc extends Document {
    vandorId: string;
    name: string;
    description: string;
    category: string;
    foodType: string;
    readyTime: string;
    price: number;
    rating: number;
    images : [string]
}

const FoodSchema = new Schema({
    name: { type: String, required: true},
    category: { type: String},
    description: { type: String, required: true},
    vandorId: { type: String},
    foodType: { type: [String], required: true},
    images: { type: [String]},
    rating: { type: Number},
    price: { type: Number, required: true},
    readyTime: { type: Number},
},
{
    toJSON: {
        transform(doc, ret){
            delete ret.createdAt;
            delete ret.updatedAt;
            delete ret.__v;
        }
    },
    timestamps: true
})

const Food = mongoose.model<FoodDoc>('Food', FoodSchema)

export { Food }   