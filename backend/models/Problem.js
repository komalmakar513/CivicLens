
const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    category: {
      type: String,
      required: true,
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
      required: true,
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
      required: true,
      trim: true,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
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
    },
    supportedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Problem", problemSchema);
