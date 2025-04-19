import userModel from "../models/userModel.js";
import logsModel from "../models/logsModel.js";

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

export const getAllLogsController = async (req, res) => {
  try {
    const logs = await logsModel
      .find({})
      .sort({ createdAt: -1 }) // Newest first
      .populate("user_id") // Populate user details
      .populate("document_id"); // Populate document details

    res.status(200).send({
      success: true,
      message: "All logs fetched successfully",
      logs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error while fetching logs",
      error,
    });
  }
};

export const getUserLogController = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).send({
        success: false,
        message: "User ID is required",
      });
    }

    const logs = await logsModel
      .find({ user_id })
      .sort({ createdAt: -1 }) // Newest first
      .populate("document_id"); // Populate document details

    res.status(200).send({
      success: true,
      message: "User logs fetched successfully",
      logs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error while fetching user logs",
      error,
    });
  }
};