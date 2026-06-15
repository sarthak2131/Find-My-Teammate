const Request = require("../models/Request");
const Project = require("../models/Project");
const Notification = require("../models/Notification");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const {
  MATCHABLE_USER_GENDERS,
  getProjectGenderAudienceLabel,
} = require("../constants/genderPreferences");

const emitNotification = (req, userId, notification) => {
  const io = req.app.get("io");
  if (io) {
    io.to(userId.toString()).emit("notification:new", notification);
  }
};

const getUserId = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (value._id) {
    return value._id.toString();
  }

  return value.toString();
};

const getProjectCapacity = (project) => Math.min(12, Math.max(1, Number(project?.maxMembers) || 4));

const ensureProjectHasCapacity = ({ project, res, actionLabel = "add more teammates" }) => {
  const currentMembers = project?.members?.length || 0;
  const maxMembers = getProjectCapacity(project);

  if (currentMembers >= maxMembers) {
    res.status(400);
    throw new Error(`This project is already full, so you cannot ${actionLabel}.`);
  }
};

const ensureGenderMatch = ({ candidate, project, res, actionLabel = "join this project" }) => {
  if (!project || project.preferredGender === "any") {
    return;
  }

  const candidateGender = candidate?.gender || "prefer-not-to-say";

  if (!MATCHABLE_USER_GENDERS.includes(candidateGender)) {
    res.status(400);
    throw new Error(
      `This project is currently looking for ${getProjectGenderAudienceLabel(
        project.preferredGender
      )}. Please update your profile gender before trying to ${actionLabel}.`
    );
  }

  if (candidateGender !== project.preferredGender) {
    res.status(400);
    throw new Error(
      `This project is currently looking for ${getProjectGenderAudienceLabel(
        project.preferredGender
      )}, so you cannot ${actionLabel} right now.`
    );
  }
};

const sendRequest = asyncHandler(async (req, res) => {
  const { receiver, projectId, note, requestType = "join" } = req.body;

  if (!projectId) {
    res.status(400);
    throw new Error("projectId is required.");
  }

  if (!["join", "invite"].includes(requestType)) {
    res.status(400);
    throw new Error("requestType must be either join or invite.");
  }

  const project = await Project.findById(projectId)
    .populate("createdBy", "name")
    .populate("teamLead", "name");

  if (!project) {
    res.status(404);
    throw new Error("Project not found.");
  }

  const ownerId = getUserId(project.createdBy);
  const teamLeadId = getUserId(project.teamLead || project.createdBy);
  const isOwner = ownerId === req.user._id.toString();
  const isCurrentUserMember = project.members.some(
    (memberId) => memberId.toString() === req.user._id.toString()
  );

  if (requestType === "join") {
    if (isOwner) {
      res.status(400);
      throw new Error("You already own this project.");
    }

    if (isCurrentUserMember) {
      res.status(400);
      throw new Error("You are already part of this team.");
    }

    ensureProjectHasCapacity({
      project,
      res,
      actionLabel: "join this project right now",
    });

    ensureGenderMatch({
      candidate: req.user,
      project,
      res,
      actionLabel: "join this project",
    });
  }

  if (requestType === "invite") {
    if (!isOwner && teamLeadId !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Only the project lead can invite teammates.");
    }

    if (!receiver) {
      res.status(400);
      throw new Error("receiver is required for team invitations.");
    }

    if (receiver.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error("You cannot invite yourself.");
    }

    const targetAlreadyMember = project.members.some(
      (memberId) => memberId.toString() === receiver.toString()
    );

    if (targetAlreadyMember) {
      res.status(400);
      throw new Error("This teammate is already in your project.");
    }

    ensureProjectHasCapacity({
      project,
      res,
      actionLabel: "invite more teammates to this project",
    });

    const targetUser = await User.findById(receiver);

    if (!targetUser) {
      res.status(404);
      throw new Error("Selected teammate not found.");
    }

    ensureGenderMatch({
      candidate: targetUser,
      project,
      res,
      actionLabel: "invite this teammate",
    });
  }

  const receiverId =
    requestType === "invite"
      ? receiver.toString()
      : (receiver || teamLeadId || ownerId).toString();

  const senderId = req.user._id.toString();

  const existingRequest = await Request.findOne({
    sender: senderId,
    receiver: receiverId,
    projectId,
    requestType,
  });

  if (existingRequest) {
    res.status(409);
    throw new Error(
      requestType === "invite"
        ? "You have already invited this teammate to the project."
        : "You have already sent a request for this project."
    );
  }

  const request = await Request.create({
    sender: senderId,
    receiver: receiverId,
    projectId,
    requestType,
    note: note || "",
  });

  const notification = await Notification.create({
    userId: receiverId,
    text:
      requestType === "invite"
        ? `${req.user.name} invited you to join "${project.title}".`
        : `${req.user.name} wants to join "${project.title}".`,
    type: "request",
    referenceId: request._id,
    referenceModel: "Request",
  });

  emitNotification(req, receiverId, notification);

  const populatedRequest = await Request.findById(request._id)
    .populate("sender", "name email profileImage skills")
    .populate("receiver", "name email profileImage")
    .populate("projectId", "title status");

  res.status(201).json({ request: populatedRequest });
});

const getRequests = asyncHandler(async (req, res) => {
  const { type = "incoming" } = req.query;
  const filters = {};

  if (type === "incoming") {
    filters.receiver = req.user._id;
  } else if (type === "outgoing") {
    filters.sender = req.user._id;
  } else {
    filters.$or = [{ receiver: req.user._id }, { sender: req.user._id }];
  }

  const requests = await Request.find(filters)
    .populate("sender", "name email profileImage skills")
    .populate("receiver", "name email profileImage")
    .populate("projectId", "title status createdBy deadline preferredGender preferredTeammateNote members maxMembers")
    .sort({ createdAt: -1 });

  res.json({ requests });
});

const acceptRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.body;

  if (!requestId) {
    res.status(400);
    throw new Error("requestId is required.");
  }

  const request = await Request.findById(requestId)
    .populate("sender", "name gender")
    .populate("receiver", "name gender");

  if (!request) {
    res.status(404);
    throw new Error("Request not found.");
  }

  if (getUserId(request.receiver) !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You cannot accept this request.");
  }

  if (request.status !== "pending") {
    res.status(400);
    throw new Error("This request has already been handled.");
  }

  const project = await Project.findById(request.projectId);

  if (!project) {
    res.status(404);
    throw new Error("Linked project not found.");
  }

  const memberToAdd =
    request.requestType === "invite"
      ? { _id: request.receiver._id.toString(), gender: request.receiver.gender }
      : { _id: request.sender._id.toString(), gender: request.sender.gender };

  ensureProjectHasCapacity({
    project,
    res,
    actionLabel: "accept more teammates into this project",
  });

  ensureGenderMatch({
    candidate: memberToAdd,
    project,
    res,
    actionLabel: "accept this teammate into the project",
  });

  const memberToAddId = memberToAdd._id;

  request.status = "accepted";
  await request.save();

  const alreadyMember = project.members.some(
    (memberId) => memberId.toString() === memberToAddId
  );

  if (!alreadyMember) {
    project.members.push(memberToAddId);
    await project.save();
  }

  const notification = await Notification.create({
    userId: request.requestType === "invite" ? request.sender._id : request.sender._id,
    text:
      request.requestType === "invite"
        ? `${req.user.name} accepted your invitation to join "${project.title}".`
        : `Your request for "${project.title}" was accepted.`,
    type: "request-update",
    referenceId: request._id,
    referenceModel: "Request",
  });

  emitNotification(req, request.sender._id, notification);

  if (request.requestType === "invite") {
    const receiverNotification = await Notification.create({
      userId: request.receiver._id,
      text: `You joined "${project.title}".`,
      type: "request-update",
      referenceId: request._id,
      referenceModel: "Request",
    });

    emitNotification(req, request.receiver._id, receiverNotification);
  }

  res.json({ request, project });
});

const rejectRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.body;

  if (!requestId) {
    res.status(400);
    throw new Error("requestId is required.");
  }

  const request = await Request.findById(requestId)
    .populate("sender", "name")
    .populate("receiver", "name");

  if (!request) {
    res.status(404);
    throw new Error("Request not found.");
  }

  if (getUserId(request.receiver) !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You cannot reject this request.");
  }

  if (request.status !== "pending") {
    res.status(400);
    throw new Error("This request has already been handled.");
  }

  request.status = "rejected";
  await request.save();

  const notification = await Notification.create({
    userId: request.sender._id,
    text:
      request.requestType === "invite"
        ? `${req.user.name} declined your invitation for the project.`
        : `Your request for project access was rejected.`,
    type: "request-update",
    referenceId: request._id,
    referenceModel: "Request",
  });

  emitNotification(req, request.sender._id, notification);

  res.json({ request });
});

module.exports = {
  sendRequest,
  getRequests,
  acceptRequest,
  rejectRequest,
};
