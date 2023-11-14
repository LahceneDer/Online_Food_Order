import { IsEmail, Length, IsNotEmpty } from 'class-validator'

export class CreateCustomerInputs {

    constructor(email: string, phone: string, password: string) {
        this.email = email;
        this.phone = phone;
        this.password = password
    }

    @IsEmail()
    email: string;

    @IsNotEmpty()
    @Length(7, 15)
    phone: string;

    @IsNotEmpty()
    @Length(6, 14)
    password: string;
}

export class LoginCustomerInputs {

    constructor(email: string, password: string) {
        this.email = email;
        this.password = password
    }

    @IsEmail()
    email: string;


    @IsNotEmpty()
    @Length(6, 14)
    password: string;
}

export class EditCustomerProfileInputs {

    constructor(firstName: string, lastName: string, address: string) {
        this.firstName = firstName;
        this.lastName = lastName
        this.address = address
    }

    @IsNotEmpty()
    firstName: string;


    @IsNotEmpty()
    lastName: string;

    @IsNotEmpty()
    address: string;
}

export interface CustomerPayload {
    _id: string;
    email: string;
    verified: boolean
}