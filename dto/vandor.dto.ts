export interface CreateVandorInputs {
    name: string,
    ownerName: string,
    foodType: [string],
    pincode: string,
    address: string,
    phone: string,
    email: string,
    password: string
}

export interface EditVandorInputs {
    email: string;
    name: string;
    address: string;
    foodTypes: string[];
}

export interface VandorLoginInputs {
    email: string;
    password: string
}

export interface VandorPayload {
    email: string;
    name: string;
    _id: any;
    foodTypes: string[];
}