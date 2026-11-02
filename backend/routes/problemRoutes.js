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

const {
  addClient,
  removeClient,
} = require("../utils/problemEvents");

const router = express.Router();

router.use(protect);

// Real-time notifications connection
router.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  res.flushHeaders();

  res.write("retry: 5000\n");
  res.write(": connected\n\n");

  addClient(res);

  const heartbeat = setInterval(() => {
    if (res.destroyed || res.writableEnded) {
      clearInterval(heartbeat);
      removeClient(res);
      return;
    }

    res.write(": heartbeat\n\n");
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeClient(res);
  });
});

// Existing problem routes
router.route("/")
  .post(createProblem)
  .get(getProblems);

router.route("/:id")
  .get(getProblemById)
  .delete(deleteProblem);

router.patch("/:id/status", adminOnly, updateProblemStatus);

router.post("/:id/support", toggleProblemSupport);

module.exports = router;