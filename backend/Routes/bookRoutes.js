const express = require("express");
const router = express.Router();

const Book = require("../models/Book");


// GET ALL BOOKS
router.get("/", async (req, res) => {
  try {
    const books = await Book.find().sort({ accNo: 1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching books",
    });
  }
});


// ADD BOOK
router.post("/", async (req, res) => {
  try {
    const newBook = new Book(req.body);

    await newBook.save();

    res.status(201).json({
      message: "Book added successfully",
      book: newBook,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding book",
      error: error.message,
    });
  }
});


// UPDATE BOOK
router.put("/:id", async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({
      message: "Error updating book",
    });
  }
});


// DELETE BOOK
router.delete("/:id", async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);

    res.json({
      message: "Book deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting book",
    });
  }
});

// BULK UPLOAD BOOKS
router.post("/bulk", async (req, res) => {
  try {
    const books = req.body.books;

    if (!books || !Array.isArray(books)) {
      return res.status(400).json({
        message: "Invalid books data",
      });
    }

    let inserted = 0;
    let skipped = 0;

    for (const book of books) {
      const existingBook = await Book.findOne({
        accNo: book.accNo,
      });

      if (existingBook) {
        skipped++;
      } else {
        await Book.create(book);
        inserted++;
      }
    }

    res.json({
      message: "Bulk upload completed",
      inserted,
      skipped,
    });
  } catch (error) {
    res.status(500).json({
      message: "Bulk upload failed",
      error: error.message,
    });
  }
});
module.exports = router;