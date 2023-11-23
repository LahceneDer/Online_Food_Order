import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { VandorPayload } from "../dto/vandor.dto"
import { JWT_SECRET } from "../config"
import { Request } from "express"
import { AuthPayload } from "../dto/Auth.dto"


export const GenerateSalt = async () => {
    return await bcrypt.genSalt()
}

export const GeneratePassword = async (password: string, salt: string) => {
    return await bcrypt.hash(password, salt)
}

export const ValidatePassword = async ( enteredPassword: string, savedPassword: string, salt?: string) => {
    return await bcrypt.compare(enteredPassword, savedPassword)
} 


export const GenerateSignature = (payload: AuthPayload) => {
    const signature = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d'})
    return signature
}


export const validateSignature = async (req: Request): Promise<boolean> => {
  try {
    const signature = req.cookies.token;

    if (signature) {
      const payload = jwt.verify(signature, JWT_SECRET) as AuthPayload;      
      req.user = payload;
      return true;
    }

    return false;
  } catch (error:any) {
    console.error('Error verifying token:', error.message);
    return false;
  }
};