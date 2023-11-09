import { NextFunction, Request, Response } from "express";
import { EditVandorInputs, VandorLoginInputs } from "../dto/vandor.dto";
import { FindVandor } from "./AdminController";
import { GenerateSignature, ValidatePassword } from "../utilities/PasswordUtility";
import mongoose, { Schema } from "mongoose";
import { CreateFoodInputs } from "../dto/Food.dto";
import { Food } from "../models/Food";


export const VandorLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = <VandorLoginInputs>req.body;

  try {
    const existingVandor = await FindVandor("", email);
    if (!existingVandor) {
      return res
        .status(404)
        .json({ message: "Vandor not found with this email" });
    }

    if (existingVandor !== null) {
      const isValide = await ValidatePassword(
        password,
        existingVandor.password
      );

      if (isValide) {
        const signature = GenerateSignature({
            _id: existingVandor._id,
            email: existingVandor.email,
            foodTypes: existingVandor.foodType,
            name: existingVandor.name
        })
        return res.status(200).json({existingVandor, signature});
      } else {
        return res.status(404).json({ message: "Password is not valid" });
      }

    }
  } catch (error) {
    res.status(500).json(error);
  }
};

export const GetVandorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const { user } = req

  if(user) {
    const existingVandor = await FindVandor(user._id)

    return res.status(200).json(existingVandor)
  }

  return res.status(404).json({ message: "Vandor not found" });


};

export const UpdateVandorProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    const { address, email, foodTypes, name } = <EditVandorInputs>req.body
    const { user } = req

    if(user) {
      const existingVandor = await FindVandor(user._id)

      if( existingVandor !== null ){
        existingVandor.name = name
        existingVandor.address = address
        existingVandor.email = email
        existingVandor.foodType = foodTypes

        const UpdatedVandor = await existingVandor.save()
        return res.json(UpdatedVandor)
      }
  
      return res.status(200).json(existingVandor)
    }
  
    return res.status(404).json({ message: "Vandor not found" });
      
  };

  export const UpdateVandorCoverImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    try {
      const { user } = req;
  
      if (!user) {
        return res.status(403).json({ message: 'Not allowed' });
      }
  
      const existingVandor = await FindVandor(user._id);
  
      if (!existingVandor) {
        return res.status(404).json({ message: 'Vendor not found' });
      }

      const files = req.files as [Express.Multer.File]      
      const images = files.map((file: Express.Multer.File) => file.filename)
  
      existingVandor.coverImage.push(...images);
      await existingVandor.save();
  
      return res.status(200).json(existingVandor);
    } catch (error) {
      // Handle any potential errors
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  export const UpdateVandorService = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
  
    const { user } = req

    if(user) {
      const existingVandor = await FindVandor(user._id)

      if( existingVandor !== null ){
        existingVandor.serviceAvailable = !existingVandor.serviceAvailable

        const UpdatedVandor = await existingVandor.save()
        return res.json(UpdatedVandor)
      }
  
      return res.status(200).json(existingVandor)
    }
  
    return res.status(404).json({ message: "Vandor not found" });
      
  };


  export const AddFood = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    
    try {
      const { user } = req;
  
      if (!user) {
        return res.status(403).json({ message: 'Not allowed' });
      }
  
      const { category, description, foodType, name, price, readyTime } =
        req.body as CreateFoodInputs;
  
      const existingVandor = await FindVandor(user._id);
  
      if (!existingVandor) {
        return res.status(404).json({ message: 'Vendor not found' });
      }

      const files = req.files as [Express.Multer.File]      
      const images = files.map((file: Express.Multer.File) => file.filename)
  
      const createdFood = await Food.create({
        vandorId: existingVandor._id,
        name,
        description,
        category,
        foodType,
        images, 
        readyTime,
        price,
        rating: 0,
      });
  
      existingVandor.foods.push(createdFood._id);
      await existingVandor.save();
  
      return res.json(createdFood);
    } catch (error) {
      // Handle any potential errors
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  export const GetFoods = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
  
    const { user } = req

    if(!user) {
      return res.status(404).json('User not authorized')
    }

      const existingVandor = await FindVandor(user._id)

      if(!existingVandor){
        return res.status(404).json('Vandor not found')
      }

      const foods = await Food.find({vandorId: existingVandor._id})
  
      return res.status(200).json(foods)
  
      
  };

