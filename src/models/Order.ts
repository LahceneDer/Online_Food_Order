import mongoose, { Schema, Document, Model } from "mongoose"

export interface OrderDoc extends Document {
    orderID: string,
    items: [any],
    totalAmount: number,
    orderDate: Date,
    paidThrough: string,
    paymentResponse: string,
    orderStatus: string
}

const OrderSchema = new Schema({
    orderID: { type: String},
    items: [{
        food: {type: Schema.Types.ObjectId, ref: "Food", required: true},
        unit: {type: Number, required: true}
    }],
    totalAmount: { type: Number, required: true},
    orderDate: { type: Date},
    paidThrough: { type: String},
    paymentResponse: { type: String},
    orderStatus: { type: String}
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

const Order = mongoose.model<OrderDoc>('Order', OrderSchema)

export { Order }   