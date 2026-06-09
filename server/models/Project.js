const mongoose = require("mongoose");
const { PROJECT_GENDER_PREFERENCES } = require("../constants/genderPreferences");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    preferredGender: {
      type: String,
      enum: PROJECT_GENDER_PREFERENCES,
      default: "any",
    },
    preferredTeammateNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["open", "in-progress", "closed"],
      default: "open",
    },
    deadline: {
      type: Date,
    },
    bookmarkedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posterUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);
