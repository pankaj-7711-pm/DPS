import userModel from "../models/userModel.js";

export const changeStatusController = async (req, res) => {
  try {
    const { email, statusValue } = req.body;
    const updatedUser = await userModel.findByIdAndUpdate(
      email,
      {
        status: statusValue,
      },
      { new: true }
    );
    await updatedUser.save();
    res.status(200).send({
      success: true,
      message:
        statusValue === 1
          ? "User Activated Successfully"
          : "User Deactivated Successfully",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Error while updating the status of the user",
      error,
    });
  }
};

export const getAllUsersController = async (req, res) => {
  try {
    const users = await userModel.find({});
    res.status(200).send({
      users,
      success: true,
      message: "All users fetched",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Error while fetching all users",
      error,
    });
  }
};

export const getAllActiveUsersController = async (req, res) => {
  try {
    const users = await userModel.find({status:1});
    res.status(200).send({
      users,
      success: true,
      message: "All Active users fetched",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Error while fetching all active users",
      error,
    });
  }
};

export const getAllInactiveUsersController = async (req, res) => {
  try {
    const users = await userModel.find({ status: 0 });
    res.status(200).send({
      users,
      success: true,
      message: "All Inactive users fetched",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Error while fetching all Inactive users",
      error,
    });
  }
};

export const getSingleUserController = async (req, res) => {
  try {
    const user = await userModel.find({ email: req.body });
    res.status(200).send({
      user,
      success: true,
      message: "User fetched",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Error while fetching user",
      error,
    });
  }
};