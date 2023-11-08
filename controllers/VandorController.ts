import { NextFunction, Request, Response } from "express";
import { EditVandorInputs, VandorLoginInputs } from "../dto/vandor.dto";
import { FindVandor } from "./AdminController";
import { GenerateSignature, ValidatePassword } from "../utilities/PasswordUtility";
import mongoose, { Schema } from "mongoose";


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
