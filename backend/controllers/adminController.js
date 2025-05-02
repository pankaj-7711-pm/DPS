import userModel from "../models/userModel.js";
import logsModel from "../models/logsModel.js";
import docsModel from "../models/docsModel.js";

export const changeStatusController = async (req, res) => {
  try {
    const { email, statusValue } = req.body;

    const updatedUser = await userModel.findOneAndUpdate(
      { email },
      { status: statusValue },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

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
    const users = await userModel.find({ status: 1 });
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
    const { email } = req.body;

    // const user = await userModel.findOne({ email });

    const user = await userModel.findOne({ email: { $regex: email } });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

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

export const getFilterDocsController = async (req, res) => {
  try {
    const { department, branch } = req.body;

    if (!department || !branch) {
      return res.status(400).send({
        success: false,
        message: "Department and Branch are required.",
      });
    }

    const documents = await docsModel
      .find({ branch, department })
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "Filtered documents fetched successfully",
      documents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error while fetching filtered documents",
      error,
    });
  }
};

export const getAllDocsController = async (req, res) => {
  try {
    const documents = await docsModel.find({}).sort({ createdAt: -1 }); // Sorted by newest first

    res.status(200).send({
      success: true,
      message: "All documents fetched successfully",
      documents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error while fetching all documents",
      error,
    });
  }
};
