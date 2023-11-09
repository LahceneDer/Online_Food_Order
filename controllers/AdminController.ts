import { NextFunction, Request, Response } from "express";
import { CreateVandorInputs } from "../dto/vandor.dto";
import { Vandor } from "../models/Vandor";
import { GeneratePassword, GenerateSalt } from "../utilities/PasswordUtility";

export const FindVandor = async (id: string | undefined, email?: string) => {
    if (email) {
        const vandor = await Vandor.findOne({ email });
        return vandor;
    } else {
        const vandor = await Vandor.findById(id);
        return vandor;
    }
};

export const CreateVandor = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const {
        address,
        email,
        foodType,
        name,
        ownerName,
        password,
        phone,
        pincode,
    } = <CreateVandorInputs>req.body;

    try {
        const existingVandor = await FindVandor("", email);

        if (existingVandor !== null) {
            return res.json({ message: "A vandor is exist with this email" });
        }

        // generate a salt and password
        const salt = await GenerateSalt();
        const userPassword = await GeneratePassword(password, salt);

        const createdVandor = await Vandor.create({
            name,
            address,
            pincode,
            foodType,
            email,
            password: userPassword,
            salt,
            ownerName,
            phone,
            rating: 0,
            serviceAvailable: false,
            coverImage: [],
            foods: []
        });

        res.json({ createdVandor });
    } catch (error) {
        return res.status(500).json(error);
    }
};

export const GetVandors = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const vandors = await Vandor.find();

        if (vandors !== null) {
            return res.json(vandors);
        }
    } catch (error) {
        return res.status(500).json(error);
    }
};

export const GetVandorByID = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const vandorId = req.params.id;

    try {
        const vandor = await FindVandor(vandorId)
        if (vandor === null) {
            return res.status(404).json({ message: "Vandor not found" });
        }

        return res.status(200).json(vandor);
    } catch (error) {
        res.status(500).json({ message: error });
    }
};
