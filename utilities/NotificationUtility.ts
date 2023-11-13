// Email

import { EMAIL, EMAIL_PASSWD, twilioAccountSID, twilioAuthToken } from "../config"

// Notifications

// OTP
export const GenerateOtpAndExpiry = (currentDate: Date) => {
    const otp = Math.floor(10000 + Math.random() * 900000)
    let expiry = currentDate
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

    return response
}

export const onRequestOTPWithEmail = (to: string, subject: string, otp: number ) => {
    const nodemailer = require("nodemailer");

    // Create a transporter using your email service provider's SMTP settings
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        user: EMAIL,
        pass: EMAIL_PASSWD,
        },
    });

    // Email content
    const mailOptions = {
        from: EMAIL,
        to: to,
        subject: subject,
        text: `Your OTP is ${otp}`,
    };

    // Send the email
    const mail = transporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) {
        console.error('Error:', error.message);
        } else {
        console.log('Email sent:', info.response);
        }
    });
    
    return mail

}

// Payment notification or email