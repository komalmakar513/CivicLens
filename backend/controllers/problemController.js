const Problem = require("../models/Problem");

const createProblem = async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      severity,
      location,
      coordinates,
      image,
    } = req.body;

    if (!title || !category || !description || !location) {
      return res.status(400).json({
        success: false,
        message: "Title, category, description, and location are required.",
      });
    }

    const problem = await Problem.create({
      title,
      category,
      description,
      severity,
      location,
      coordinates,
      image,
      reportedBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Problem reported successfully.",
      problem,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getProblems = async (req, res) => {
  try {
    const { category, severity, status } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;

    const problems = await Problem.find(filter)
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: problems.length,
      problems,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch problems.",
    });
  }
};

const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .populate("reportedBy", "name email");

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found.",
      });
    }

    return res.status(200).json({
      success: true,
      problem,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid problem ID.",
    });
  }
};

const updateProblemStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Reported",
      "Under Review",
      "In Progress",
      "Resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid problem status.",
      });
    }

    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Problem status updated.",
      problem,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Could not update problem status.",
    });
  }
};

const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found.",
      });
    }

    const isOwner =
      problem.reportedBy.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reports.",
      });
    }

    await problem.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Problem deleted successfully.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Could not delete problem.",
    });
  }
};

module.exports = {
  createProblem,
  getProblems,
  getProblemById,
  updateProblemStatus,
  deleteProblem,
};