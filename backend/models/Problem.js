const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Problem title is required"],
      trim: true,
      maxlength: 120,
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Road Damage",
        "Garbage",
        "Streetlight",
        "Waterlogging",
        "Drainage",
        "Footpath Damage",
        "Other",
      ],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: 2000,
    },

    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Reported", "Under Review", "In Progress", "Resolved"],
      default: "Reported",
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },

    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180,
      },
    },

    image: {
      type: String,
      default: "",
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    votes: {
      type: Number,
      default: 0,
      min: 0,
    },

    supportedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Problem = mongoose.model("Problem", problemSchema);

module.exports = Problem;