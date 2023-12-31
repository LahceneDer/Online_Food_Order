import { plainToClass } from "class-transformer";
import { validate } from 'class-validator'
import { NextFunction, Request, Response } from "express";
import { CreateCustomerInputs, EditCustomerProfileInputs, LoginCustomerInputs, OrderInputs } from "../dto/Customer.dto";
import { GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } from "../utilities/PasswordUtility";
import { Customer, CustomerDoc } from "../models/Customer";
import { GenerateOtpAndExpiry, onRequestOTP, onRequestOTPWithEmail } from "../utilities/NotificationUtility";
import { Food } from "../models/Food";
import { Order } from "../models/Order";
import { Types } from "mongoose";



export const CustomerSignUp = async (req: Request, res: Response, next: NextFunction) => {

  const customerInputs = plainToClass(CreateCustomerInputs, req.body)

  const InputErrors = await validate(customerInputs, { validationError: { target: true } })

  if (InputErrors.length > 0) {
    return res.status(400).json(InputErrors)
  }
  const { email, phone, password } = customerInputs as any
  const existCustomer = await Customer.findOne({ email })

  if (existCustomer) {
    return res.status(409).json({ message: "A customer exists with provided email" })
  }

  // Generate salt and password
  const salt = await GenerateSalt()
  const newPassword = await GeneratePassword(password, salt)

  const { otp, expiry } = GenerateOtpAndExpiry(new Date())

  // Create new customer
  const customer: CustomerDoc = await Customer.create({
    email,
    password: newPassword,
    phone,
    salt,
    otp,
    otp_expiry: expiry,
    firstName: '',
    lasrName: '',
    address: '',
    verified: false,
    lat: 0,
    lng: 0,
    orders: []
  })

  if (customer) {

    //Send the OTP to customer
      const SMSSent = await onRequestOTP(otp, phone)

      if(SMSSent.status !== "sent") {
          // Execute onRequestOTPWithEmail if onRequestOTP fails
          const emailResponse = onRequestOTPWithEmail(
            customer.email,
            "OTP Request",
            otp
          );
      }
      

    //generate the signature/token
    const signature = GenerateSignature({
      _id: customer._id,
      email: customer.email,
      verified: customer.verified
    })

    res.cookie('token', `${signature}`);

    // send the result to client
    return res.status(201).json({ signature, verified: customer.verified, email: customer.email })
  }

  return res.status(400).json({ message: "Error with Signup" })

};

export const CustomerLogin = async (req: Request, res: Response, next: NextFunction) => {

  const customerInputs = plainToClass(LoginCustomerInputs, req.body)
  const InputErrors = await validate(customerInputs, { validationError: { target: true } })

  if (InputErrors.length > 0) {
    return res.status(400).json(InputErrors)
  }

  const { email, password } = customerInputs as any
  try {
    const customer = await Customer.findOne({ email })
    if (!customer) {
      return res.status(404).json({ message: "Email not valid" })
    }

    const validate = await ValidatePassword(password, customer.password, customer.salt)
    if (!validate) {
      return res.status(400).json({ message: "Password not valid" })
    }
    const signature = GenerateSignature({
      _id: customer._id,
      email: customer.email,
      verified: customer.verified
    })

    res.cookie('token', `${signature}`);

    return res.status(201).json({
      signature,
      email: customer.email,
      verified: customer.verified
    })
    
  } catch (error) {
    return res.status(400).json({ message: "Login error !!!" })
  }


};

export const CustomerVerify = async (req: Request, res: Response, next: NextFunction) => {

  const { otp } = req.body
  const customer = req.user
  

  if(!customer) {
    return res.status(404).json({ message: "Not authorized" })
  }

    try {
      const profile = await Customer.findById(customer._id)
      if (!profile) {
        return res.status(404).json({ message: "Customer not found" })
      }
            
      if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
        profile.verified = true

        const updatedCustomer = await profile.save()

        // generate the signature
        const signature = GenerateSignature({
          _id: updatedCustomer._id,
          email: updatedCustomer.email,
          verified: updatedCustomer.verified
        })

        res.cookie('token', `${signature}`);

        return res.status(201).json({ signature, email: updatedCustomer.email, verified: updatedCustomer.verified })
      } else {
        return res.status(400).json({ message: "Error with OTP validation" })

      }
    } catch (error) {
      return res.status(400).json({ message: "Something went wrong" })
    }

};

export const RequestOtp = async (req: Request, res: Response, next: NextFunction) => {

  const customer = req.body
  if (!customer) {
    return res.status(403).json({ message: "Not authorized" })
  }

  try {
    const profile = await Customer.findById(customer._id)
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" })
    }

    const { otp, expiry } = GenerateOtpAndExpiry(new Date())

    profile.otp = otp
    profile.otp_expiry = expiry
    await profile.save()

    try {
      await onRequestOTP(otp, profile.phone)
    } catch (error) {
      // Execute onRequestOTPWithEmail if onRequestOTP fails
      const emailResponse = onRequestOTPWithEmail(
        profile.email,
        "OTP Request",
        otp
      );

      
    }

    
      // try {

      // } catch (emailError) {
      //   // Handle errors from onRequestOTPWithEmail
      //   console.error("Error sending email OTP:", emailError);
  
      //   // Provide a meaningful response to the client
      //   return res.status(500).json({ error: "Failed to send OTPs" });
      // }


    return res.status(201).json({ message: "OTP sent to your registred phone number" })
  } catch (error) {
    return res.status(400).json({ message: "Request OTP error" })
  }
};

export const GetCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user

  if (!user) {
    return res.status(403).json({ message: 'not authorized' })
  }

  try {
  const profile = await Customer.findById(user._id)
  if(!profile){
    return res.status(404).json({ message: 'Customer not found' })
  }
  return res.status(200).json(profile)

  } catch (error) {
    return res.status(400).json({ message: 'Error with get customer profile' })
  }
};

export const UpdateCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

  const user = req.user

  if (!user) {
    return res.status(403).json({ message: 'not authorized' })
  }
  const customerInputs = plainToClass(EditCustomerProfileInputs, req.body)
  const InputErrors = await validate(customerInputs, { validationError: { target: true } })

  if (InputErrors.length > 0) {
    return res.status(400).json(InputErrors)
  }

  const { firstName, lastName, address } = customerInputs as any
  try {
    const customer = await Customer.findById(user._id)
    if (!customer) {
      return res.status(404).json({ message: "Password not valid" })
    }

    customer.firstName = firstName
    customer.lastName = lastName
    customer.address = address

    const result = await customer.save()


    return res.status(201).json(result)
  } catch (error) {
    return res.status(400).json({ message: "Login error !!!" })
  }

};


export const CreateOrder = async (req: Request, res: Response, next: NextFunction) => {

  // grap current login customer
  const customer = req.user
  
  if(!customer){
    return res.status(403).json({ message: "Not authorized"})
  }  
  // create an order ID
  try {
    const profile = await Customer.findById(customer._id)

  const orderId = `${Math.floor(Math.random() * 89999) + 1000}`

  // Grab order items from request
  const cart = req.body as [OrderInputs] // [ { id: xx, unit: xx } ]

  let cartItems = Array()

  let netAmount = 0.0

  // Calculate order amount
  const foods = await Food.find().where('_id').in(cart.map(item => item._id)).exec()

  foods.map(food => {
    cart.map(({ _id, unit}) => {
      
      if(String(food._id) == _id){
        netAmount += (food.price + unit)
        cartItems.push({ food, unit})
      }
    })
  })



  // Create Order with item descriptions
  if(cartItems) {

    const createdOrder = await Order.create({
      orderID: orderId,
      items: cartItems,
      totalAmount: netAmount,
      orderDate: new Date(),
      paidThrough: 'COD',
      paymentResponse: '',
      orderStatus: "waiting"
    })    
      // Finally update orders to user account
    if(createdOrder) {
      profile?.orders.push(createdOrder)

      await profile?.save()
      
      return res.status(200).json(createdOrder)
    }    

  }

  } catch (error) {
    return res.status(400).json({ message: "Error with create an order"})
  }

}

export const GetOrders = async (req: Request, res: Response, next: NextFunction) => {

  const customer = req.user

  if(!customer){
    return res.status(403).json({ message: "Not authorized"})
  }  

  try {
    const currentCustomer = await Customer.findById(customer._id).populate('customer')
    
    return res.status(200).json(currentCustomer?.orders)

  } catch (error) {
    return res.status(400).json({ message: "Error with fetching orders"})
    
  }

}

export const GetOrderByID = async (req: Request, res: Response, next: NextFunction) => {

  const orderId = req.params.id  

  if(orderId) {
    try {
      const order = await Order.findById(orderId).populate(`items.food`)
      return res.status(200).json(order)

    } catch (error) {
    return res.status(400).json({ message: "Error with fetching orders"})
      
    }
  }
}

