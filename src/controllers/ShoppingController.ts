import express, { Request, Response, NextFunction } from "express";
import { Vandor, VandorDoc } from "../models/Vandor";
import { FoodDoc } from "../models/Food";

export const GetFoodAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  try {
    const result = await Vandor.find({ pincode, serviceAvailable: false })
      .sort([["rating", "descending"]])
      .populate("foods");

    if (!(result.length > 0)) {
      return res.status(400).json({ message: "Data not found" });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(400)
      .json({ status: "failed", message: "something went wrong" });
  }
};

export const GetTopResturants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  try {
    const result = await Vandor.find({ pincode, serviceAvailable: false })
      .sort([["rating", "descending"]])
      .limit(10);

    if (!(result.length > 0)) {
      return res.status(400).json({ message: "Data not found" });
    }
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(400)
      .json({ status: "failed", message: "something went wrong" });
  }
};

export const GetFoodsIn30Min = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    const pincode = req.params.pincode;

    try {
      const result = await Vandor.find({ pincode, serviceAvailable: false })
        .populate('foods')
  
      if (result.length > 0) {
        let foodResult: any = []
        result.map((vandor: any) => {
            const foods = vandor.foods as [FoodDoc]
            foodResult.push(...foods.filter(food => food.readyTime <= 30))
        })
      return res.status(200).json(foodResult);
      }
      return res.status(400).json({ message: "Data not found" });
    } catch (error) {
      return res
        .status(400)
        .json({ status: "failed", message: "something went wrong" });
    }
};

export const SearchFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  try {
    const result = await Vandor.find({ pincode, serviceAvailable: false })
      .populate('foods')

    if (result.length > 0) {
      let foodResult: any = []
      result.map( item => foodResult.push(...item.foods))
    return res.status(200).json(foodResult);
    }
    return res.status(400).json({ message: "Data not found" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "failed", message: "something went wrong" });
  }
};

export const GetRestaurantByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const id = req.params.id

  try {
    const vandor = await Vandor.findById(id)
    if(!vandor) {
      return res
      .status(404)
      .json({ status: "failed", message: "Not found" });
    }

    return res
    .status(200)
    .json({ status: "failed", data: vandor });
  } catch (error) {
    return res
    .status(500)
    .json({ status: "failed", message: "something went wrong", error });
  }
};
