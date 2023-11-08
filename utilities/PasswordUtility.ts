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


export const GenerateSignature = (payload: VandorPayload) => {
    const signature = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d'})
    return signature
}


export const ValidateSignature = async (req: any) => {
    const signature = req.get('Authorization')

    if(signature) {
        const payload = await jwt.verify(signature.split(' ')[1], JWT_SECRET) as AuthPayload
        req.user = payload
        return true
    }
    return false
}