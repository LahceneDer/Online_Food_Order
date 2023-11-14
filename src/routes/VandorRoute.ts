import express, { Request, Response, NextFunction } from "express"
import { AddFood, GetFoods, GetVandorProfile, UpdateVandorCoverImage, UpdateVandorProfile, UpdateVandorService, VandorLogin } from "../controllers/VandorController"
import { Authenticate } from "../middlewares/CommonAuth"
import multer from "multer"

const imageStorage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, 'images')
    },
    filename(req, file, callback) {
        const newName = Date.now() + '_' + Math.round(Math.random() * 1E9) + '_' + file.originalname;
        callback(null, newName)
        // callback(null, new Date().toISOString()+'_'+file.originalname)
    },
})

const images = multer({ storage: imageStorage}).array('images', 10)

const router = express.Router()

router.post('/login', VandorLogin)

router.use(Authenticate)
router.get('/profile',GetVandorProfile)
router.patch('/profile', UpdateVandorProfile)
router.patch('/coverimage', images, UpdateVandorCoverImage)
router.patch('/service', UpdateVandorService)
router.post('/food', images, AddFood)
router.get('/foods', GetFoods)

router.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.json('Hello from vandor')
})


export { router as VandorRoute }