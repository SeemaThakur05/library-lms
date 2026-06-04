const express = require("express");
const router = express.Router();

const Member = require("../models/Member");

// GET ALL MEMBERS
router.get("/", async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Error fetching members" });
  }
});

// ADD MEMBER
router.post("/", async (req, res) => {
  try {
    const member = await Member.create(req.body);
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({
      message: "Error adding member",
      error: error.message,
    });
  }
});

// UPDATE MEMBER
router.put("/:id", async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: "Error updating member" });
  }
});

// DELETE MEMBER
router.delete("/:id", async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: "Member deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting member" });
  }
});

module.exports = router;