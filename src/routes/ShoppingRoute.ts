import { Router } from 'express'
import { GetFoodAvailability, GetFoodsIn30Min, GetRestaurantByID, GetTopResturants, SearchFoods } from '../controllers/ShoppingController'

const router = Router()

/** ------------------ Food Availability  ------------------- **/
router.get('/:pincode', GetFoodAvailability)

/** ------------------ Top Restaurants  ------------------- **/
router.get('/top-restaurants/:pincode', GetTopResturants)


/** ------------------ Foods Available in 30 Minutes  ------------------- **/
router.get('/foods-in-30-minutes/:pincode', GetFoodsIn30Min)


/** ------------------ Search Foods  ------------------- **/
router.get('/search/:pincode', SearchFoods)


/** ------------------ Find Restaurant By ID  ------------------- **/
router.get('/restaurant/:id', GetRestaurantByID)


export { router as ShoppingRoute}