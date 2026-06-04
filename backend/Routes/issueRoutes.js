const express = require("express");
const router = express.Router();

const IssueRecord = require("../models/IssueRecord");
const Book = require("../models/Book");

router.get("/", async (req, res) => {
  try {
    const records = await IssueRecord.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Error fetching issue records" });
  }
});

router.post("/issue", async (req, res) => {
  try {
    const record = await IssueRecord.create(req.body);

    await Book.findOneAndUpdate(
      { accNo: req.body.accessionNo },
      { availability: "Issued", status: "Issued" }
    );

    res.status(201).json({
      message: "Book issued successfully",
      record,
    });
  } catch (error) {
    res.status(500).json({
      message: "Issue failed",
      error: error.message,
    });
  }
});

router.put("/return/:id", async (req, res) => {
  try {
    const record = await IssueRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    await Book.findOneAndUpdate(
      { accNo: record.accessionNo },
      { availability: "Available", status: "Available" }
    );

    res.json({
      message: "Book returned successfully",
      record,
    });
  } catch (error) {
    res.status(500).json({ message: "Return failed" });
  }
});

router.put("/reissue/:id", async (req, res) => {
  try {
    const record = await IssueRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      message: "Book reissued successfully",
      record,
    });
  } catch (error) {
    res.status(500).json({ message: "Reissue failed" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await IssueRecord.findByIdAndDelete(req.params.id);

    res.json({
      message: "Issue record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;