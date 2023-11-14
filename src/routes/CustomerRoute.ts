import express, { Request, Response, NextFunction } from "express"
import { CustomerLogin, CustomerSignUp, CustomerVerify, GetCustomerProfile, RequestOtp, UpdateCustomerProfile } from "../controllers/CustomerController"
import { Authenticate } from "../middlewares/CommonAuth"

const router = express.Router()

/** ------------------ Signup / Create Customer  ------------------- **/
router.post('/signup', CustomerSignUp)

/** ------------------ Login  ------------------- **/
router.post('/login', CustomerLogin)



// Authentication
router.use(Authenticate)

/** ------------------ Verify customer Account  ------------------- **/
router.patch('/verify', CustomerVerify)


/** ------------------ OTP / Reuesting OTP  ------------------- **/
router.get('/otp', RequestOtp)


/** ------------------ Profile  ------------------- **/
router.get('/profile',GetCustomerProfile)

router.patch('/profile', UpdateCustomerProfile)





export { router as CustomerRoute }