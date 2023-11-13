import mongoose, { Schema, Document } from "mongoose"

export interface CustomerDoc extends Document {
    firstName: string;
    lastName: string;
    address: string;
    phone: string;
    email: string;
    password: string;
    salt: string;
    verified: boolean;
    lat: number;
    lng: number;
    otp: number;
    otp_expiry: Date;
}

const CustomerSchema = new Schema({
    firstName: { type: String},
    lastName: { type: String},
    address: { type: String},
    phone: { type: String, required: true},
    email: { type: String, required: true},
    password: { type: String, required: true},
    salt: { type: String, required: true},
    verified: { type: String, required: true},
    lat: { type: Number},
    lng: { type: Number},
    otp: { type: Number, required: true},
    otp_expiry: { type: Date, required: true},
},
{
    toJSON: {
        transform(doc, ret){
            delete ret.password;
            delete ret.salt;
            delete ret.createdAt;
            delete ret.updatedAt;
            delete ret.__v;
        }
    },
    timestamps: true
})

const Customer = mongoose.model<CustomerDoc>('Customer', CustomerSchema)

export { Customer }