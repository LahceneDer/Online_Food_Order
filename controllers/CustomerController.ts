import { plainToClass } from "class-transformer";
import { validate } from 'class-validator'
import { NextFunction, Request, Response } from "express";
import { CreateCustomerInputs, EditCustomerProfileInputs, LoginCustomerInputs } from "../dto/Customer.dto";
import { GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } from "../utilities/PasswordUtility";
import { Customer, CustomerDoc } from "../models/Customer";
import { GenerateOtpAndExpiry, onRequestOTP } from "../utilities/NotificationUtility";



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

  const { otp, expiry } = GenerateOtpAndExpiry()

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
    lng: 0
  })

  if (customer) {

    //Send the OTP to customer
    try {
      const sent = await onRequestOTP(otp, phone)
    } catch (error) {
      return res.status(400).json({ message: "Sending OTP error" })
    }

    //generate the signature/token
    const signature = GenerateSignature({
      _id: customer._id,
      email: customer.email,
      verified: customer.verified
    })

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
      return res.status(404).json({ message: "Password not valid" })
    }

    const validate = await ValidatePassword(password, customer.password, customer.salt)
    if (!validate) {
      return res.status(400).json({ message: "Login error !!!" })
    }
    const signature = GenerateSignature({
      _id: customer._id,
      email: customer.email,
      verified: customer.verified
    })

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

  if (customer) {
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

        return res.status(201).json({ signature, email: updatedCustomer.email, verified: updatedCustomer.verified })
      }
    } catch (error) {
      return res.status(400).json({ message: "Error with OTP validation" })
    }

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

    const { otp, expiry } = GenerateOtpAndExpiry()

    profile.otp = otp
    profile.otp_expiry = expiry
    await profile.save()

    await onRequestOTP(otp, profile.phone)

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


