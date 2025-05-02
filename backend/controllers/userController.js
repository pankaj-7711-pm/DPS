import userModel from "../models/userModel.js";
import docsModel from "../models/docsModel.js";
import logsModel from "../models/logsModel.js";


export const uploadController = async (req, res) => {
  try {
    const { file_name, file_path, branch, department } = req.body;

    if (!file_name || !file_path || !branch || !department) {
      return res.send({ message: "All fields are required" });
    }

    const document = new docsModel({
      file_name,
      file_path,
      branch,
      department,
      user_id: req.user._id,
    });

    const savedDocument = await document.save(); // Save and get the document with _id

    // Create a log entry after document is saved
    const logEntry = new logsModel({
      user_id: req.user._id,
      action: "uploaded_document",
      document_id: savedDocument._id,
    });

    await logEntry.save(); // Save the log entry

    res.status(201).send({
      success: true,
      message: "Document Uploaded Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Uploading Document",
      error,
    });
  }
};

export const getAllDocsController = async (req, res) => {
  try {
    const documents = await docsModel.find({user_id:req.user._id});
    res.status(200).send({
      documents,
      success: true,
      message: "All documents fetched",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in fetching Documents",
      error,
    });
  }
};

export const getOneDocController = async (req, res) => {
  try {
    const { docid } = req.body;
    const document = await docsModel.findOne({ _id: docid });
    res.status(200).send({
      document,
      success: true,
      message: "All documents fetched",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in fetching Documents",
      error,
    });
  }
};

export const getFilterDocController = async (req, res) => {
  try {
    const { branch, department } = req.body;

    if (!branch || !department) {
      return res.status(400).send({
        success: false,
        message: "Branch and Department are required for filtering",
      });
    }

    const documents = await docsModel.find({ branch, department, user_id:req.user._id });

    res.status(200).send({
      success: true,
      message: "Filtered documents fetched successfully",
      documents,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in fetching filtered documents",
      error,
    });
  }
};