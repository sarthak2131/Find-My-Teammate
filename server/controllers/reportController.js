const Report = require("../models/Report");
const Project = require("../models/Project");
const asyncHandler = require("../middleware/asyncHandler");

// @desc    Create a new report
// @route   POST /api/reports
// @access  Private
const createReport = asyncHandler(async (req, res) => {
  const { projectId, reason } = req.body;

  if (!projectId || !reason) {
    res.status(400);
    throw new Error("Project ID and reason are required.");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error("Hackathon post not found.");
  }

  // Create the report
  const report = await Report.create({
    reporter: req.user._id,
    project: projectId,
    reason: String(reason).trim(),
  });

  res.status(201).json({
    message: "Report submitted successfully.",
    report,
  });
});

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private/Admin
const getReports = asyncHandler(async (req, res) => {
  const reports = await Report.find()
    .populate("reporter", "name email profileImage")
    .populate({
      path: "project",
      populate: {
        path: "createdBy",
        select: "name email profileImage isSuspended",
      },
    })
    .sort({ createdAt: -1 });

  res.json({ reports });
});

// @desc    Resolve/Dismiss a report
// @route   PUT /api/reports/:id
// @access  Private/Admin
const resolveReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error("Report not found.");
  }

  report.status = "resolved";
  await report.save();

  res.json({
    message: "Report resolved and marked clean.",
    report,
  });
});

module.exports = {
  createReport,
  getReports,
  resolveReport,
};
