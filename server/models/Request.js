const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    requestType: {
      type: String,
      enum: ["join", "invite"],
      default: "join",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    note: {
      type: String,
      default: "",
      maxlength: 250,
    },
  },
  {
    timestamps: true,
  }
);

requestSchema.index({ sender: 1, receiver: 1, projectId: 1 }, { unique: true });

module.exports = mongoose.model("Request", requestSchema);
