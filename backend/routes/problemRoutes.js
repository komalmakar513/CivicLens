
const express = require("express");

const {
  createProblem,
  getProblems,
  getProblemById,
  updateProblemStatus,
  deleteProblem,
  toggleProblemSupport,
} = require("../controllers/problemController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.use(protect);

router.route("/")
  .post(createProblem)
  .get(getProblems);

router.route("/:id")
  .get(getProblemById)
  .delete(deleteProblem);

router.patch("/:id/status", adminOnly, updateProblemStatus);

router.post("/:id/support", toggleProblemSupport);

module.exports = router;
