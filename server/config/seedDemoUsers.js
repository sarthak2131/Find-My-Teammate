const User = require("../models/User");
const Notification = require("../models/Notification");
const {
  GENERATED_AVATAR_URLS,
  createDefaultProfileImage,
} = require("../constants/defaultAvatar");

const demoUsers = [
  {
    name: "Aarav Product Lead",
    email: "lead.demo@fmt.com",
    password: "demo12345",
    role: "user",
    skills: ["Product Strategy", "React", "Pitching"],
    interests: ["Hackathons", "Startups", "SaaS"],
    bio: "Leads product-first teams for hackathons and startup MVPs.",
    availability: "Looking for frontend and backend teammates",
    gender: "male",
    githubLink: "https://github.com/demo-lead",
    profileImage: createDefaultProfileImage(),
  },
  {
    name: "Siya Full Stack Dev",
    email: "builder.demo@fmt.com",
    password: "demo12345",
    role: "user",
    skills: ["Node.js", "MongoDB", "Socket.io"],
    interests: ["Open Source", "Realtime Apps", "Backend Systems"],
    bio: "Builds fast APIs, realtime systems, and deployable project demos.",
    availability: "Open for backend-heavy collaboration",
    gender: "female",
    githubLink: "https://github.com/demo-builder",
    profileImage: createDefaultProfileImage(),
  },
  {
    name: "Admin Demo",
    email: "admin.demo@fmt.com",
    password: "demo12345",
    role: "admin",
    skills: ["Admin Ops", "Review", "Mentoring"],
    interests: ["Platform Quality", "Team Management"],
    bio: "Admin account for checking dashboards, activity, and platform health.",
    availability: "Monitoring the workspace",
    gender: "male",
    githubLink: "https://github.com/demo-admin",
    profileImage: createDefaultProfileImage(),
  },
];

const ensureDemoUsers = async () => {
  const demoUserIds = [];

  for (const demoUser of demoUsers) {
    const existingUser = await User.findOne({ email: demoUser.email }).select("+password");

    if (!existingUser) {
      const createdUser = await User.create(demoUser);
      demoUserIds.push(createdUser._id);
      continue;
    }

    existingUser.name = demoUser.name;
    existingUser.password = demoUser.password;
    existingUser.role = demoUser.role;
    existingUser.skills = demoUser.skills;
    existingUser.interests = demoUser.interests;
    existingUser.bio = demoUser.bio;
    existingUser.availability = demoUser.availability;
    existingUser.gender = demoUser.gender;
    existingUser.githubLink = demoUser.githubLink;
    existingUser.profileImage = demoUser.profileImage;

    await existingUser.save();
    demoUserIds.push(existingUser._id);
  }

  await User.updateMany(
    {
      $or: [
        { profileImage: { $exists: false } },
        { "profileImage.url": { $exists: false } },
        { "profileImage.url": { $in: GENERATED_AVATAR_URLS } },
      ],
    },
    {
      $set: {
        "profileImage.url": createDefaultProfileImage().url,
        "profileImage.publicId": "",
      },
    }
  );

  await Notification.deleteMany({ userId: { $in: demoUserIds } });

  console.log("Demo accounts are ready.");
};

module.exports = { ensureDemoUsers, demoUsers };
