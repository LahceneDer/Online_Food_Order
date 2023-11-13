// Email

import { twilioAccountSID, twilioAuthToken } from "../config"

// Notifications

// OTP
export const GenerateOtpAndExpiry = () => {
    const otp = Math.floor(10000 + Math.random() * 900000)
    let expiry = new Date()
    expiry.setTime( new Date().getTime() + (30 * 60 * 1000) )

    return { otp, expiry}
}


export const onRequestOTP = async ( otp: number, toPhoneNumber: string ) => {
    const accountSid = twilioAccountSID
    const authToken = twilioAuthToken
    const client = require('twilio')(accountSid, authToken)

    const response = await client.messages.create({
        body: `Your OTP is ${otp}`,
        from: '+12565734309',
        to: toPhoneNumber
    })
    console.log(otp);
    

    return response
}
// Payment notification or email