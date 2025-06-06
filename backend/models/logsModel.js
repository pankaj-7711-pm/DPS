import mongoose from "mongoose";

const logsSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.ObjectId,
      ref: "users",
      required: true,
    },
    action: {
      type: String,
      default: "uploaded_document",
    },
    document_id: {
      type: mongoose.ObjectId,
      ref: "docs",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("logs", logsSchema);
