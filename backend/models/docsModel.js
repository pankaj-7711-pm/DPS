import mongoose from "mongoose";

const docsSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.ObjectId,
      ref: "users",
      required: true,
    },
    file_name: {
      type: String,
      required: true,
    },
    file_path: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("docs", docsSchema);
