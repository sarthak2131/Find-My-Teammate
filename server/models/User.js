const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { DEFAULT_AVATAR, createDefaultProfileImage } = require("../constants/defaultAvatar");
const { USER_GENDERS } = require("../constants/genderPreferences");

const profileImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      default: DEFAULT_AVATAR,
    },
    publicId: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },
    profileImage: {
      type: profileImageSchema,
      default: createDefaultProfileImage,
    },
    githubLink: {
      type: String,
      default: "",
    },
    availability: {
      type: String,
      default: "Open to collaborate",
    },
    gender: {
      type: String,
      enum: USER_GENDERS,
      default: "prefer-not-to-say",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspensionReason: {
      type: String,
      default: "",
    },
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("avatar").get(function () {
  return this.profileImage?.url || DEFAULT_AVATAR;
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });


userSchema.pre("save", async function savePassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
