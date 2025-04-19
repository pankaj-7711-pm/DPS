import userModel from "../models/userModel.js";
import {
  comparePassword,
  hashPassword,
} from "../middlewares/authMiddleware.js";
import JWT from "jsonwebtoken";
import { json } from "express";
import dotenv from "dotenv";

export const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //validation
    if (!name || !email || !password) {
      return res.send({ message: "All fields are required" });
    }

    //check user
    const existingUser = await userModel.findOne({ email });

    // existing user
    if (existingUser) {
      return res.send({
        success: false,
        message: "Already Registered Please Login",
      });
    }

    //register user
    const hashedPassword = await hashPassword(password);

    //save
    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      role: 0,
      status: 0,
    });
    await user.save();
    res.status(201).send({
      success: true,
      message: "User Registered Successfully. Now wait for sometime and try logging in as it will be reviewed by admin.",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Registration",
      error,
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.send({
        success: false,
        message: "User not registered",
      });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Login",
      });
    }

    if (user.status === 0) {
      return res.send({
        success: false,
        message: "User is not approved. Please try again after sometime.",
      });
    }

    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    
    res.status(200).send({
      success: true,
      message: "Login Successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Login",
      error,
    });
  }
};
