
const mongoose = require("mongoose");
const Problem = require("../models/Problem");

// Create a new problem report
const createProblem = async (req, res) => {
    try {
        const {
            title,
            category,
            description,
            severity,
            location,
            coordinates,
        } = req.body;

        // Required field validation
        if (
            !title?.trim() ||
            !category ||
            !description?.trim() ||
            !location?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide title, category, description and location.",
            });
        }

        // Validate GPS coordinates if supplied
        let savedCoordinates;

        if (coordinates !== undefined && coordinates !== null) {
            const latitude = Number(coordinates.latitude);
            const longitude = Number(coordinates.longitude);

            if (
                coordinates.latitude === undefined ||
                coordinates.longitude === undefined ||
                coordinates.latitude === null ||
                coordinates.longitude === null ||
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude) ||
                latitude < -90 ||
                latitude > 90 ||
                longitude < -180 ||
                longitude > 180
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide valid latitude and longitude coordinates.",
                });
            }

            savedCoordinates = {
                latitude,
                longitude,
            };
        }

        const problem = await Problem.create({
            title: title.trim(),
            category,
            description: description.trim(),
            severity: severity || "Medium",
            location: location.trim(),
            coordinates: savedCoordinates,
            reportedBy: req.user._id,
        });

        return res.status(201).json({
            success: true,
            message: "Problem reported successfully.",
            problem,
        });

    } catch (error) {
        console.error("Create problem error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while creating problem.",
        });
    }
};


// Get all problems with optional filters
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
        console.error("Get problems error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching problems.",
        });
    }
};


// Get a single problem by ID
const getProblemById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID.",
            });
        }

        const problem = await Problem.findById(id)
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
        console.error("Get problem error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching problem.",
        });
    }
};


// Update problem status
const updateProblemStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "Reported",
            "Under Review",
            "In Progress",
            "Resolved",
        ];

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID.",
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem status.",
            });
        }

        const problem = await Problem.findByIdAndUpdate(
            id,
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
            message: "Problem status updated successfully.",
            problem,
        });

    } catch (error) {
        console.error("Update problem status error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating problem status.",
        });
    }
};


// Delete a problem
const deleteProblem = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID.",
            });
        }

        const problem = await Problem.findById(id);

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
                message: "You are not authorized to delete this problem.",
            });
        }

        await problem.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Problem deleted successfully.",
        });

    } catch (error) {
        console.error("Delete problem error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while deleting problem.",
        });
    }
};


// Support or remove support from a problem
const toggleProblemSupport = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID.",
            });
        }

        const problem = await Problem.findById(id);

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found.",
            });
        }

        const userId = req.user._id;

        const alreadySupported = problem.supportedBy.some(
            supportedUser => supportedUser.toString() === userId.toString()
        );

        let supported;

        if (alreadySupported) {
            problem.supportedBy.pull(userId);
            supported = false;
        } else {
            problem.supportedBy.addToSet(userId);
            supported = true;
        }

        problem.votes = problem.supportedBy.length;

        await problem.save();

        return res.status(200).json({
            success: true,
            message: supported
                ? "Problem supported successfully."
                : "Problem support removed successfully.",
            votes: problem.votes,
            supported,
        });

    } catch (error) {
        console.error("Toggle problem support error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating problem support.",
        });
    }
};


module.exports = {
    createProblem,
    getProblems,
    getProblemById,
    updateProblemStatus,
    deleteProblem,
    toggleProblemSupport,
};
